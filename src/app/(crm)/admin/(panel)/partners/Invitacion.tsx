"use client";

import { useEffect, useState } from "react";

/* ============================================================================
   EL ENLACE DE INVITACIÓN
   ----------------------------------------------------------------------------
   Vive quince minutos, así que la pantalla enseña la cuenta atrás en lugar de
   una hora de caducidad: «caduca en 12:40» dice qué hacer; «caduca a las
   14:35» obliga a mirar el reloj y restar.

   Y los dos botones que se usan de verdad: copiar el enlace, y abrirlo en
   WhatsApp ya escrito. Enviar es lo que se hace con esto el 100 % de las
   veces.
   ========================================================================== */

export function Invitacion({
  codigo,
  caducaEn,
  origen,
}: {
  readonly codigo: string;
  /** Marca de tiempo ISO. */
  readonly caducaEn: string;
  /** El dominio público, que el servidor conoce y el navegador no. */
  readonly origen: string;
}) {
  const [restante, setRestante] = useState(() => faltan(caducaEn));
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setRestante(faltan(caducaEn)), 1000);
    return () => clearInterval(t);
  }, [caducaEn]);

  const enlace = `${origen}/join/${codigo}`;
  const vivo = restante > 0;

  const mensaje = `Le invito a publicar en DCM ACCESS. Entre con su correo de Google desde este enlace, que caduca en ${MINUTOS} minutos:\n\n${enlace}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin portapapeles queda el enlace a la vista para copiarlo a mano.
    }
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-(--radius-card) border p-4 ${
        vivo ? "border-accent/40 bg-accent/[0.04]" : "border-line-soft opacity-60"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-xl tracking-[0.2em]" data-numeric>
          {codigo}
        </span>

        <span className={`eyebrow text-[0.7rem] ${vivo ? "text-accent" : "text-fg-muted/60"}`}>
          {vivo ? `Caduca en ${reloj(restante)}` : "Caducado"}
        </span>
      </div>

      <p className="text-fg-muted/70 text-xs break-all">{enlace}</p>

      {vivo ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copiar}
            className="eyebrow border-line text-fg-muted hover:text-fg cursor-pointer rounded-(--radius-card) border px-3 py-1.5 text-[0.7rem] transition-colors"
          >
            {copiado ? "Copiado" : "Copiar enlace"}
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow border-accent/60 text-accent hover:bg-accent hover:text-surface rounded-(--radius-card) border px-3 py-1.5 text-[0.7rem] transition-colors"
          >
            Enviar por WhatsApp
          </a>
        </div>
      ) : null}
    </div>
  );
}

const MINUTOS = 15;

function faltan(iso: string): number {
  return Math.max(0, new Date(iso).getTime() - Date.now());
}

function reloj(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}
