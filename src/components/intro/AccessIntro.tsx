"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AccessMark } from "@/components/brand/AccessMark";

/* ============================================================================
   EXPERIENCIA DE ENTRADA — TEXT SCRAMBLE
   ----------------------------------------------------------------------------
   Revela DCM ACCESS resolviendo caracteres aleatorios. Nada del sitio cambia:
   el overlay usa los mismos tokens, la misma marca y la misma tipografía que
   ya existen, y desaparece dejando la página exactamente como estaba.

   Tres decisiones que sostienen todo lo demás:

   1. CELDAS DE ANCHO FIJO. Cada carácter vive en una caja de ancho constante,
      así que al cambiar de glifo nada se desplaza. Sin esto el scramble
      "baila" y se lee como un error, no como un sistema resolviendo.

   2. RESUELVE HACIA LA LUZ. Lo pendiente va en `mist`, lo resuelto en `ivory`.
      La palabra no solo se ordena: se ilumina. Sin colores nuevos.

   3. SIN ESTÉTICA HACKER. Tics de ~50 ms —no por frame—, sin glitch, sin
      flash, sin distorsión. La sensación es de precisión, no de intrusión.
   ========================================================================== */

const TARGET = "DCM ACCESS";
const SPACE_INDEX = TARGET.indexOf(" ");

/**
 * Repertorio de sustitución. Mayúsculas y dígitos, más unos pocos signos
 * tipográficos del ejemplo del brief. Deliberadamente sin katakana, binario ni
 * símbolos de terminal: eso empujaría la pieza al registro que hay que evitar.
 */
const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ·/#—";

/** Milisegundos entre sustituciones. Rápido, pero legible. */
const TICK_MS = 50;

const TIMELINE = {
  /** Todo aleatorio hasta aquí. */
  chaos: 380,
  dcmFrom: 380,
  dcmTo: 1000,
  spaceAt: 1030,
  accessFrom: 1060,
  accessTo: 1740,
  /**
   * Tiempo que la composición permanece quieta DESPUÉS de resolverse la
   * palabra, contado desde `accessTo`.
   *
   * No es un adorno: el filete y el descriptor tardan 480 ms en entrar, así
   * que de esta cifra hay que descontarlos. Lo que sobra es el tiempo real de
   * lectura de "Global Assets • Premium Services • Exclusive Opportunities".
   *
   * Deliberadamente NO se escala en móvil: leer cuesta lo mismo en un teléfono
   * que en un portátil. Lo que se acorta en pantallas pequeñas es la
   * animación, no la lectura.
   */
  holdAfterResolve: 1400,
  /**
   * Duración total de la salida, que ahora es SECUENCIAL:
   *   0–320 ms    se retira el wordmark
   *   200–800 ms  se disuelve la cortina
   *   350–950 ms  entra la página enfocándose
   * Debe cubrir la última en terminar, o `finish()` la cortaría a medias.
   */
  out: 980,
} as const;

/** En móvil se acorta la parte ANIMADA: la misma coreografía, menos espera. */
const MOBILE_SCALE = 0.72;

function randomChar(): string {
  return POOL[Math.floor(Math.random() * POOL.length)];
}

/**
 * Momento en que cada carácter deja de rotar. "DCM" se resuelve primero, luego
 * el espacio, y por último "ACCESS" — el orden que pide el brief.
 */
function revealSchedule(scale: number): readonly number[] {
  const t = (value: number) => value * scale;

  return [...TARGET].map((_, index) => {
    if (index < 3) {
      return t(TIMELINE.dcmFrom + ((index + 1) / 3) * (TIMELINE.dcmTo - TIMELINE.dcmFrom));
    }
    if (index === SPACE_INDEX) return t(TIMELINE.spaceAt);

    const position = index - SPACE_INDEX;
    const total = TARGET.length - SPACE_INDEX - 1;
    return t(
      TIMELINE.accessFrom + (position / total) * (TIMELINE.accessTo - TIMELINE.accessFrom),
    );
  });
}

type Phase = "armed" | "running" | "resolved" | "out" | "done";

export function AccessIntro({ descriptor }: { readonly descriptor: string }) {
  // El servidor y el primer render del cliente coinciden: la palabra final,
  // oculta por CSS mientras la fase es "armed". Sin parpadeo y sin desajuste
  // de hidratación, porque no hay nada aleatorio en el render inicial.
  const [chars, setChars] = useState<readonly string[]>(() => [...TARGET]);
  const [resolved, setResolved] = useState<readonly boolean[]>(() => TARGET.split("").map(() => true));
  const [phase, setPhase] = useState<Phase>("armed");

  const frame = useRef<number>(0);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const failsafe = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closing = useRef(false);

  /**
   * Retira la cortina AL INSTANTE, sin transición.
   *
   * Es la vía obligatoria cuando el documento está oculto: una transición
   * iniciada en una pestaña en segundo plano queda suspendida y no termina
   * nunca, dejando el desenfoque y el escalado pegados a la página. Si no hay
   * nadie mirando tampoco hay nada que animar.
   */
  const finish = useCallback(() => {
    cancelAnimationFrame(frame.current);
    clearTimeout(failsafe.current);
    clearTimeout(exitTimer.current);

    const root = document.documentElement;

    /**
     * El orden importa. Se desactivan las transiciones, se retira el atributo
     * y se fuerza un recálculo de estilo ANTES de volver a activarlas: así los
     * valores finales se aplican de golpe y no queda ninguna transición en
     * vuelo. Sin esto, un documento que se oculta a mitad del revelado dejaría
     * la opacidad congelada en 0 — es decir, la página en blanco.
     */
    root.classList.add("dcm-intro-cut");
    delete root.dataset.intro;
    root.getBoundingClientRect();
    root.classList.remove("dcm-intro-cut");

    setPhase("done");
  }, []);

  /** Cierre cinematográfico: fundido de la cortina y enfoque del contenido. */
  const dismiss = useCallback(() => {
    // Varias vías pueden pedir el cierre a la vez —fin de la animación, clic,
    // red de seguridad—. Solo la primera cuenta.
    if (closing.current) return;
    closing.current = true;

    cancelAnimationFrame(frame.current);
    clearTimeout(failsafe.current);

    if (document.hidden) {
      finish();
      return;
    }

    setPhase("out");
    document.documentElement.dataset.intro = "out";
    exitTimer.current = setTimeout(finish, TIMELINE.out);
  }, [finish]);

  useEffect(() => {
    /**
     * Visita repetida en la misma sesión, o sin JavaScript en el arranque: el
     * guardián en línea no marcó el documento. No hay nada que hacer y no se
     * toca el estado — la regla CSS `html:not([data-intro])` ya deja el
     * overlay fuera del flujo y fuera de la pintura.
     */
    if (document.documentElement.dataset.intro !== "in") return;

    /**
     * Pestaña en segundo plano: no hay primera impresión que causar, y el
     * navegador SUSPENDE `requestAnimationFrame` mientras el documento está
     * oculto. Sin esta salida, abrir el sitio con clic central o al restaurar
     * una sesión dejaría la cortina congelada tapando la página hasta que el
     * usuario la mirase. Se revela directamente.
     */
    if (document.hidden) {
      closing.current = true;
      const skip = setTimeout(finish, 0);
      return () => clearTimeout(skip);
    }

    /**
     * Si la pestaña pasa a segundo plano a mitad de la secuencia, se corta en
     * seco por el mismo motivo: nada de transiciones suspendidas.
     */
    const onVisibilityChange = () => {
      if (document.hidden) finish();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    const unwatch = () => document.removeEventListener("visibilitychange", onVisibilityChange);

    // Con movimiento reducido no se revuelve nada: la palabra ya está puesta,
    // solo se sostiene un instante y se disuelve (§39).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Sin animación la palabra y el descriptor están puestos desde el primer
      // fotograma, así que todo este tiempo es de lectura.
      const raf = requestAnimationFrame(() => setPhase("resolved"));
      const timer = setTimeout(dismiss, 1200);
      return () => {
        unwatch();
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }

    const scale = window.innerWidth < 768 ? MOBILE_SCALE : 1;
    const schedule = revealSchedule(scale);
    // El sostenido se suma al final del scramble; no se escala (ver TIMELINE).
    const holdAt = TIMELINE.accessTo * scale + TIMELINE.holdAfterResolve;

    const started = performance.now();
    // Fuerza que el primer fotograma ya sustituya: así el paso de "armed" a
    // caracteres girando ocurre en un frame, sin ventana visible en blanco.
    let lastTick = Number.NEGATIVE_INFINITY;

    const loop = (now: number) => {
      const elapsed = now - started;

      if (elapsed >= holdAt) {
        dismiss();
        return;
      }

      if (elapsed - lastTick >= TICK_MS) {
        lastTick = elapsed;

        const nextResolved = schedule.map((at) => elapsed >= at);

        setPhase(nextResolved.every(Boolean) ? "resolved" : "running");
        setResolved(nextResolved);
        setChars(
          [...TARGET].map((char, index) =>
            char === " " ? " " : nextResolved[index] ? char : randomChar(),
          ),
        );
      }

      frame.current = requestAnimationFrame(loop);
    };

    frame.current = requestAnimationFrame(loop);

    /**
     * Red de seguridad independiente del bucle. `setTimeout` sigue corriendo
     * donde `requestAnimationFrame` se detiene —pestaña que pasa a segundo
     * plano a mitad de la secuencia, ventana ocluida, ahorro de energía—, así
     * que pase lo que pase la cortina se levanta. Una animación decorativa
     * jamás puede dejar el sitio inaccesible.
     */
    failsafe.current = setTimeout(dismiss, holdAt + 500);

    return () => {
      unwatch();
      cancelAnimationFrame(frame.current);
      clearTimeout(exitTimer.current);
      clearTimeout(failsafe.current);
    };
  }, [dismiss, finish]);

  // Cualquier intención de avanzar la salta: nadie debería tener que esperar
  // una animación para usar la página.
  useEffect(() => {
    if (phase === "done" || phase === "out" || phase === "armed") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab" || event.key === "Enter") dismiss();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", dismiss, { passive: true, once: true });
    window.addEventListener("touchstart", dismiss, { passive: true, once: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchstart", dismiss);
    };
  }, [phase, dismiss]);

  if (phase === "done") return null;

  return (
    <div
      className="dcm-intro"
      data-phase={phase}
      // Decorativo de principio a fin: el lector de pantalla lee la página, no
      // una cortina de caracteres rotando.
      aria-hidden="true"
      onClick={dismiss}
    >
      <div className="dcm-intro__glow" />

      <div className="dcm-intro__stack">
        <AccessMark className="dcm-intro__mark" weight={7} />

        <p className="dcm-intro__word">
          {chars.map((char, index) => (
            <span
              key={index}
              className="dcm-intro__cell"
              data-space={char === " " || undefined}
              data-resolved={resolved[index] || undefined}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </p>

        <span className="dcm-intro__rule" />
        <span className="dcm-intro__descriptor">{descriptor}</span>
      </div>
    </div>
  );
}
