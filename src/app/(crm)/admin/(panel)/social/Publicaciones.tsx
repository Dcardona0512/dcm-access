"use client";

import { useEffect, useRef, useState } from "react";

import { AdminButton } from "@/components/admin/AdminUI";
import type { Publicacion, Red } from "@/lib/data/supabase/social";

import { avanzarPublicacion, borrar, marcarPublicadoAMano } from "./actions";

/* ============================================================================
   LO SUBIDO, Y EN QUÉ PUNTO VA
   ----------------------------------------------------------------------------
   Aquí vive el sondeo. Instagram tarda minutos en procesar un vídeo y no avisa
   cuando termina: hay que preguntarle. Sin tareas en segundo plano, quien
   pregunta es esta pantalla mientras está abierta — una llamada cada diez
   segundos, que avanza UN paso y vuelve.

   Si se cierra la pestaña no se pierde nada: el punto exacto está guardado, y
   «continuar» lo retoma. Lo que sí hay que saber es que el contenedor de
   Instagram caduca a las 24 horas, así que un vídeo abandonado a medias hay
   que empezarlo de nuevo.
   ========================================================================== */

const CADA = 10_000;

export function Publicaciones({ lista }: { readonly lista: readonly Publicacion[] }) {
  if (lista.length === 0) {
    return (
      <p className="border-line text-fg-muted rounded-(--radius-card) border border-dashed px-6 py-12 text-center text-sm text-pretty">
        Todavía no hay vídeos. El primero que suba aparecerá aquí con su estado en cada red.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="eyebrow text-fg-muted text-[0.8rem]">Vídeos</h2>

      <ul className="flex flex-col gap-4">
        {lista.map((item) => (
          <li key={item.id}>
            <Tarjeta publicacion={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Tarjeta({ publicacion }: { readonly publicacion: Publicacion }) {
  const instagram = publicacion.destinos.find((d) => d.network === "instagram");
  const tiktok = publicacion.destinos.find((d) => d.network === "tiktok");

  const [trabajando, setTrabajando] = useState(false);
  const [parte, setParte] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(instagram?.error ?? null);
  const [terminado, setTerminado] = useState(instagram?.status === "published");

  /*
    Un candado contra el solapamiento: si una ronda tarda más que el intervalo,
    la siguiente no debe salir encima. Dos pasos a la vez sobre la misma
    publicación crearían dos contenedores en Instagram.
  */
  const enCurso = useRef(false);

  async function paso() {
    if (enCurso.current) return;
    enCurso.current = true;
    setTrabajando(true);

    try {
      const resultado = await avanzarPublicacion(publicacion.id);
      setParte(resultado.mensaje);

      if (resultado.estado === "failed") {
        setError(resultado.mensaje);
        return false;
      }

      setError(null);
      if (!resultado.sigue) setTerminado(true);
      return resultado.sigue;
    } catch {
      setError("No se pudo continuar. Inténtelo de nuevo.");
      return false;
    } finally {
      enCurso.current = false;
      setTrabajando(false);
    }
  }

  // Un vídeo que se quedó procesándose retoma solo al abrir la pantalla: es
  // justo el caso de quien cerró la pestaña y vuelve.
  const [sondeando, setSondeando] = useState(instagram?.status === "processing");

  useEffect(() => {
    if (!sondeando) return;

    let vivo = true;
    const id = setInterval(async () => {
      const sigue = await paso();
      if (!sigue && vivo) setSondeando(false);
    }, CADA);

    return () => {
      vivo = false;
      clearInterval(id);
    };
    /*
      Solo `sondeando` manda. `paso` se vuelve a crear en cada render —cambia
      de estado cada vez que avanza— y ponerlo en las dependencias reiniciaría
      el intervalo a mitad de cuenta, de modo que la siguiente consulta no
      llegaría nunca a los diez segundos. La función se captura a propósito.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sondeando]);

  async function publicar() {
    const sigue = await paso();
    if (sigue) setSondeando(true);
  }

  const puedePublicar =
    instagram !== undefined && !terminado && !trabajando && instagram.status !== "published";

  return (
    <article className="border-line bg-surface-raised flex flex-col gap-4 rounded-(--radius-card) border p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <video
          src={publicacion.videoUrl}
          controls
          preload="metadata"
          className="border-line-soft h-44 w-auto rounded-(--radius-card) border bg-black"
        />

        <div className="flex min-w-[16rem] flex-1 flex-col gap-2">
          <p className="text-fg-muted line-clamp-4 text-sm text-pretty">
            {publicacion.caption || <span className="text-fg-muted/50">Sin pie</span>}
          </p>

          <div className="flex flex-wrap gap-2">
            {instagram ? (
              <Insignia
                red="instagram"
                estado={terminado ? "published" : instagram.status}
                permalink={instagram.permalink}
              />
            ) : null}
            {tiktok ? (
              <Insignia red="tiktok" estado={tiktok.status} permalink={tiktok.permalink} />
            ) : null}
          </div>
        </div>
      </div>

      {parte && !error ? <p className="text-fg-muted/70 text-xs">{parte}</p> : null}

      {error ? (
        <p className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-4 py-3 text-xs text-pretty">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {puedePublicar ? (
          <button
            type="button"
            onClick={() => void publicar()}
            disabled={trabajando || sondeando}
            className="eyebrow border-accent/50 text-accent hover:bg-accent/10 cursor-pointer rounded-(--radius-card) border px-2.5 py-1.5 text-[0.75rem] transition-colors disabled:cursor-default disabled:opacity-50"
          >
            {sondeando || trabajando
              ? "Publicando…"
              : instagram?.status === "processing"
                ? "Continuar"
                : "Publicar en Instagram"}
          </button>
        ) : null}

        {/*
          TikTok, mientras se publica a mano: el vídeo descargado y el texto al
          portapapeles son los dos gestos que de verdad ahorran tiempo.
        */}
        {tiktok && tiktok.status === "manual" ? (
          <>
            <a
              href={publicacion.videoUrl}
              download
              className="eyebrow border-line text-fg-muted hover:text-fg rounded-(--radius-card) border px-2.5 py-1.5 text-[0.75rem] transition-colors"
            >
              Descargar para TikTok
            </a>

            <Copiar texto={publicacion.caption} />

            <form action={marcarPublicadoAMano}>
              <input type="hidden" name="postId" value={publicacion.id} />
              <input type="hidden" name="red" value="tiktok" />
              <AdminButton>Ya lo subí a TikTok</AdminButton>
            </form>
          </>
        ) : null}

        <form action={borrar} className="ml-auto">
          <input type="hidden" name="postId" value={publicacion.id} />
          <AdminButton tone="danger">Borrar</AdminButton>
        </form>
      </div>
    </article>
  );
}

function Copiar({ texto }: { readonly texto: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        } catch {
          // Sin portapapeles, el pie sigue a la vista para copiarlo a mano.
        }
      }}
      className="eyebrow border-line text-fg-muted hover:text-fg cursor-pointer rounded-(--radius-card) border px-2.5 py-1.5 text-[0.75rem] transition-colors"
    >
      {copiado ? "Copiado" : "Copiar el pie"}
    </button>
  );
}

const ETIQUETAS: Record<string, string> = {
  pending: "sin publicar",
  creating: "preparando",
  processing: "procesando",
  published: "publicado",
  failed: "falló",
  manual: "a mano",
};

function Insignia({
  red,
  estado,
  permalink,
}: {
  readonly red: Red;
  readonly estado: string;
  readonly permalink: string | null;
}) {
  const nombre = red === "instagram" ? "Instagram" : "TikTok";
  const tono =
    estado === "published"
      ? "border-accent/60 text-accent"
      : estado === "failed"
        ? "border-danger/50 text-danger"
        : "border-line-soft text-fg-muted";

  const contenido = `${nombre} · ${ETIQUETAS[estado] ?? estado}`;

  if (permalink) {
    return (
      <a
        href={permalink}
        target="_blank"
        rel="noopener noreferrer"
        className={`eyebrow rounded-(--radius-card) border px-2.5 py-1.5 text-[0.7rem] transition-colors ${tono}`}
      >
        {contenido}
      </a>
    );
  }

  return (
    <span className={`eyebrow rounded-(--radius-card) border px-2.5 py-1.5 text-[0.7rem] ${tono}`}>
      {contenido}
    </span>
  );
}
