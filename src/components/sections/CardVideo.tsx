"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================================
   METRAJE DENTRO DE UNA TARJETA
   ----------------------------------------------------------------------------
   Es el mismo vídeo que hace de fondo en la página de esa categoría, pero aquí
   las reglas son las contrarias a las de `HeroVideo`.

   Allí el metraje es lo primero que se ve y se descarga cuanto antes. Aquí hay
   TRES a la vez, en una sección que vive por debajo del pliegue, y entre los
   tres pesan casi treinta megas. Descargarlos al abrir la portada sería cobrar
   ese peaje a todo el que entra, incluso a quien nunca baja hasta aquí.

   Por eso nada se carga hasta que la tarjeta se acerca a la pantalla: el `src`
   no está en el HTML, lo pone el efecto cuando el observador avisa.

   Debajo siempre queda la placa editorial: mientras no haya un fotograma
   decodificado, el elemento no pinta nada y se ve ella. Nunca hay un
   rectángulo vacío.
   ========================================================================== */

export function CardVideo({ src }: { readonly src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Mismo trato que en el fondo de página: con movimiento reducido o con
    // ahorro de datos, el metraje no se descarga y la placa se basta sola.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;

    if (connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType ?? "")) return;

    /**
     * De un solo disparo: en cuanto la tarjeta se acerca, se enciende y el
     * observador se retira.
     *
     * Antes esto también pausaba al salir de pantalla, y era la fuente de un
     * fallo desagradable: bastaba un salto de scroll que entrara y saliera
     * para dejar el vídeo cargado del todo y parado para siempre. El ahorro no
     * lo valía —los navegadores ya frenan el pintado de lo que no se ve— y la
     * lógica de encender y apagar era justo la que se atascaba.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setActivo(true);
        observer.disconnect();
      },
      // Un margen generoso: arranca la descarga poco antes de que la tarjeta
      // asome, para que al llegar ya haya imagen y no un negro de medio
      // segundo.
      { rootMargin: "300px 0px", threshold: 0.01 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  /**
   * Reproducir va en su propio efecto, que corre DESPUÉS del pintado.
   *
   * Pedirlo dentro del observador era el error: `play()` salía en el mismo
   * instante que `setActivo`, cuando el elemento todavía no tenía `src`
   * —React aún no había vuelto a pintar—, así que la promesa se rechazaba y
   * nadie lo reintentaba. El vídeo cogía su fuente y se quedaba parado.
   */
  useEffect(() => {
    if (!activo) return;
    const video = videoRef.current;
    if (video?.paused) void video.play().catch(() => {});
  }, [activo]);

  return (
    <video
      ref={videoRef}
      // `activo` gobierna la descarga: sin `src` el navegador no pide nada.
      src={activo ? src : undefined}
      muted
      loop
      playsInline
      preload="none"
      tabIndex={-1}
      aria-hidden="true"
      // Red de seguridad por si el efecto se adelantó al primer fotograma.
      onCanPlay={(event) => {
        if (event.currentTarget.paused) void event.currentTarget.play().catch(() => {});
      }}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-(--duration-slow) ease-(--ease-brand) group-hover:scale-[1.02]"
    />
  );
}
