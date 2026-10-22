"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { AdminButton } from "@/components/admin/AdminUI";
import { createBrowserClient } from "@/lib/supabase/browser";

import { guardarVideo, pedirHuecoDeSubida, type EstadoDeFormulario } from "./actions";

/* ============================================================================
   SUBIR UN VÍDEO
   ----------------------------------------------------------------------------
   El archivo NO viaja con el formulario: se sube aparte, directo al
   almacenamiento con una URL firmada, y al enviar solo va su ruta. Por eso el
   `<input type="file">` no lleva `name` — un input con nombre se serializa
   dentro del FormData aunque el servidor lo ignore, y la petición moriría en
   el límite de 1 MB de las server actions.

   Antes de gastar una subida de doscientos megas se comprueba aquí lo que
   Instagram va a exigir después. Es el único momento en que un problema de
   formato se puede explicar con palabras: cuando lo rechaza Instagram, lo hace
   con un «ERROR» y poco más.
   ========================================================================== */

const MAXIMO_BYTES = 300 * 1024 * 1024;
const MINIMO_SEGUNDOS = 3;
const MAXIMO_SEGUNDOS = 15 * 60;

const inicial: EstadoDeFormulario = { status: "idle" };

type Estado = "vacío" | "revisando" | "subiendo" | "listo" | "falló";

export function SubirVideo({ postId }: { readonly postId: string }) {
  const [state, action] = useActionState(guardarVideo, inicial);

  const [estado, setEstado] = useState<Estado>("vacío");
  const [path, setPath] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onElegir(archivo: File | undefined) {
    if (!archivo) return;

    setAviso(null);
    setPath(null);
    setNombre(archivo.name);
    setEstado("revisando");

    const problema = await revisar(archivo);
    if (problema) {
      setAviso(problema);
      setEstado("falló");
      return;
    }

    setEstado("subiendo");

    const hueco = await pedirHuecoDeSubida(postId, {
      mimeType: archivo.type,
      bytes: archivo.size,
    });

    if (!hueco.ok) {
      setAviso(hueco.message);
      setEstado("falló");
      return;
    }

    /*
      El nombre del bucket va escrito aquí y no importado de `storage.ts`
      porque ese archivo es `server-only` y traerlo rompería el build. Lo que
      autoriza la subida no es la clave del navegador: es el token firmado que
      acaba de acuñar el servidor.
    */
    const { error } = await createBrowserClient()
      .storage.from("social-media")
      .uploadToSignedUrl(hueco.slot.path, hueco.slot.token, archivo);

    if (error) {
      setAviso("No se pudo subir el vídeo. Inténtelo de nuevo.");
      setEstado("falló");
      return;
    }

    setPath(hueco.slot.path);
    setEstado("listo");
  }

  return (
    <section className="border-line bg-surface-raised flex flex-col gap-5 rounded-(--radius-card) border p-6">
      <h2 className="eyebrow text-fg-muted text-[0.8rem]">Nuevo vídeo</h2>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm"
        >
          {state.message}
        </p>
      ) : null}

      {aviso ? (
        <p
          role="alert"
          className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-sm text-pretty"
        >
          {aviso}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime"
          className="hidden"
          onChange={(event) => void onElegir(event.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="eyebrow border-line text-fg-muted hover:border-fg-muted/60 hover:text-fg cursor-pointer rounded-(--radius-card) border px-4 py-2.5 text-[0.75rem] transition-colors"
        >
          {path ? "Cambiar vídeo" : "Elegir vídeo"}
        </button>

        <span className="text-fg-muted/70 text-xs">
          {estado === "revisando"
            ? "Revisando el vídeo…"
            : estado === "subiendo"
              ? "Subiendo…"
              : estado === "listo"
                ? `${nombre} · listo`
                : "MP4 o MOV, hasta 300 MB y 15 minutos"}
        </span>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="mediaPath" value={path ?? ""} />

        <label className="flex flex-col gap-2">
          <span className="eyebrow text-fg-muted text-[0.75rem]">Pie</span>
          <textarea
            name="caption"
            rows={4}
            maxLength={2200}
            placeholder="Lo que acompaña al vídeo en las dos redes."
            className="border-line bg-surface focus:border-accent resize-y rounded-(--radius-card) border px-3 py-2.5 text-sm outline-none"
          />
        </label>

        <fieldset className="flex flex-wrap items-center gap-5">
          <legend className="eyebrow text-fg-muted mb-2 text-[0.75rem]">Dónde publicar</legend>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="instagram" defaultChecked className="accent-accent" />
            Instagram
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="tiktok" defaultChecked className="accent-accent" />
            TikTok
            <span className="text-fg-muted/60 text-xs">(a mano, por ahora)</span>
          </label>
        </fieldset>

        <Guardar listo={path !== null} />
      </form>
    </section>
  );
}

function Guardar({ listo }: { readonly listo: boolean }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-center gap-3">
      <AdminButton tone="accent" disabled={!listo || pending}>
        {pending ? "Guardando…" : "Guardar"}
      </AdminButton>
      {!listo ? <span className="text-fg-muted/60 text-xs">Falta elegir el vídeo.</span> : null}
    </div>
  );
}

/* --- Lo que Instagram va a exigir, comprobado antes de subir ---------------- */

async function revisar(archivo: File): Promise<string | null> {
  if (archivo.size > MAXIMO_BYTES) {
    return "El vídeo pasa de 300 MB, que es el tope de Instagram.";
  }

  const medida = await medir(archivo);

  if (medida && (medida.segundos < MINIMO_SEGUNDOS || medida.segundos > MAXIMO_SEGUNDOS)) {
    return `Instagram admite entre 3 segundos y 15 minutos; este dura ${Math.round(
      medida.segundos,
    )} segundos.`;
  }

  if (await indiceAlFinal(archivo)) {
    return (
      "Este MP4 lleva el índice al final del archivo e Instagram lo rechazaría sin explicar " +
      "por qué. Vuelva a exportarlo (en la mayoría de editores, la opción se llama «optimizar " +
      "para web» o «faststart»)."
    );
  }

  return null;
}

/** Duración y tamaño del cuadro, leídos por el propio navegador. */
function medir(archivo: File): Promise<{ segundos: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(archivo);
    const video = document.createElement("video");

    const terminar = (valor: { segundos: number } | null) => {
      URL.revokeObjectURL(url);
      resolve(valor);
    };

    video.preload = "metadata";
    video.onloadedmetadata = () => terminar({ segundos: video.duration });
    // Que el navegador no sepa leerlo no es razón para frenar la subida: el
    // que decide de verdad es Instagram.
    video.onerror = () => terminar(null);
    video.src = url;
  });
}

/**
 * ¿El índice del MP4 está al final?
 *
 * Instagram exige que el átomo `moov` —el índice del archivo— vaya ANTES de
 * los datos. Es el requisito que más vídeos tumba y el peor de diagnosticar,
 * porque la respuesta de la API no lo menciona.
 *
 * Se recorren las cajas de primer nivel leyendo solo sus cabeceras, ocho bytes
 * cada una: si aparece `mdat` antes que `moov`, el índice está al final. No se
 * descarga el archivo entero — se leen unos pocos bytes salteados.
 */
async function indiceAlFinal(archivo: File): Promise<boolean> {
  // Los .mov de un iPhone llevan la misma estructura, pero su exportación no
  // suele tener este problema y la comprobación no es gratis en claridad.
  if (!archivo.type.includes("mp4")) return false;

  let offset = 0;

  try {
    for (let caja = 0; caja < 64; caja++) {
      const cabecera = await archivo.slice(offset, offset + 16).arrayBuffer();
      if (cabecera.byteLength < 8) return false;

      const vista = new DataView(cabecera);
      let tamano = vista.getUint32(0);
      const tipo = new TextDecoder().decode(new Uint8Array(cabecera, 4, 4));

      if (tipo === "moov") return false;
      if (tipo === "mdat") return true;

      // Tamaño 1 significa que el de verdad son los ocho bytes siguientes; 0
      // significa «hasta el final del archivo», y entonces ya no hay más cajas.
      if (tamano === 1) {
        if (cabecera.byteLength < 16) return false;
        tamano = Number(vista.getBigUint64(8));
      }
      if (tamano === 0) return false;
      if (tamano < 8) return false;

      offset += tamano;
      if (offset >= archivo.size) return false;
    }
  } catch {
    // Ante la duda, no se bloquea la subida: decide Instagram.
    return false;
  }

  return false;
}
