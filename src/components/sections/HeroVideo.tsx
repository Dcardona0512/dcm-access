"use client";

import { useEffect, useRef } from "react";

/* ============================================================================
   FONDO DE VÍDEO
   ----------------------------------------------------------------------------
   Capa FIJA detrás de una página entera. Es el fondo del scramble de entrada,
   no se va con el hero, y permanece mientras se recorre la página: las
   secciones pasan por encima translúcidas, así que el metraje se percibe como
   una textura viva y no como un banner que desaparece al primer scroll.

   El metraje se pasa por `src`, de modo que cada página puede traer el suyo.
   Hoy: la portada y Aviación. Son vídeos MUY distintos —uno casi negro, el
   otro claro— y esa diferencia no se resuelve aquí sino en la sombra local de
   cada bloque de texto, que es donde importa.

   Tres reglas lo gobiernan.

   1. EL TEXTO MANDA SOBRE LA IMAGEN. La sombra se calcula contra el fotograma
      MÁS CLARO del metraje, no contra la media: si se usa la media, el texto
      desaparece justo cuando pasa un destello.

   2. APARECE DE INMEDIATO. `autoPlay` y `preload="auto"` van en el atributo,
      no en un efecto: el navegador descarga y arranca durante el parseo del
      HTML, sin esperar a que React hidrate. Y la visibilidad no pasa por
      JavaScript — no hay puerta de opacidad que pueda quedarse cerrada.

   3. SE APAGA CUANDO MOLESTA. Con `prefers-reduced-motion` no se reproduce, y
      con ahorro de datos ni se descarga. Debajo siempre queda un fondo que se
      sostiene solo (§28, §39).
   ========================================================================== */

/**
 * Tono del metraje. No es decorativo: la cortina de entrada se dibuja ENCIMA
 * de esta capa y necesita saber contra qué compite. El halo del scramble está
 * calibrado para metraje oscuro; sobre uno claro el descriptor cae a 2,5:1.
 *
 * `dark`  — media de luminancia baja (la portada: 0,06).
 * `bright`— media alta o blancos frecuentes (Aviación: 0,48, picos de 0,98).
 */
export type VideoTone = "dark" | "bright";

export function HeroVideo({
  src = "/media/hero.mp4",
  tone = "dark",
  start = 0,
}: {
  readonly src?: string;
  readonly tone?: VideoTone;
  /**
   * Segundo por el que empieza el metraje.
   *
   * No todos los vídeos empiezan por su mejor plano. Inmobiliario abre con
   * seis segundos de tejado contra el cielo antes de cortar a la toma aérea
   * que sí cuenta algo, y recortar el archivo para eso sería perder metraje
   * que quizá quiera usarse más adelante.
   */
  readonly start?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Se deja el primer fotograma como imagen fija.
      video.pause();
      return;
    }

    /**
     * Ahorro de datos y redes lentas: `play()` es quien dispara la descarga
     * del archivo, y en 2G esos megas son un peaje que nadie pidió. Importa
     * más aquí desde que hay metrajes de distinto peso por página.
     */
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;

    if (connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType ?? "")) {
      video.removeAttribute("src");
      return;
    }

    /**
     * Segunda red para el punto de entrada, por si el fragmento de la
     * dirección no se respetó.
     *
     * Aquí NO vale escuchar `loadedmetadata`: con `preload="auto"` el
     * navegador tiene los metadatos mucho antes de que React hidrate, así que
     * el evento ya pasó y el escuchador llega tarde —el mismo tropiezo que en
     * su día dejó este vídeo invisible esperando un `canplay` que nunca
     * volvió a dispararse—. Se comprueba el estado, que es un hecho, en lugar
     * de esperar un aviso.
     */
    if (start > 0 && video.currentTime < start && video.readyState >= 1) {
      video.currentTime = start;
    }

    /**
     * Red de seguridad para el atributo `autoplay`. Normalmente el navegador
     * ya arrancó por su cuenta durante el parseo; esto solo cubre los casos en
     * que lo rechazó. Si vuelve a rechazarlo tampoco pasa nada: el fondo
     * compuesto sostiene la composición por sí solo.
     */
    if (video.paused) void video.play().catch(() => {});
  }, [start]);

  return (
    <div
      aria-hidden="true"
      // Lo lee el CSS de la cortina para ajustar su halo al metraje que tiene
      // detrás. Es la única vía: el scramble vive en el layout y no sabe qué
      // página lo está mostrando.
      data-tone={tone}
      // `dcm-video-layer` la excluye del desenfoque de la cortina de entrada:
      // el resto del contenido espera borroso detrás, pero el vídeo se queda
      // nítido porque ES el fondo del scramble.
      className="dcm-video-layer fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Color de base: cubre el hueco antes del primer fotograma, de modo que
          nunca se ve un rectángulo vacío. */}
      <div className="bg-surface absolute inset-0" />

      <video
        /**
         * Fuerza el remontaje cuando cambia el metraje. Sin esto, al navegar
         * en cliente entre dos páginas con fondos distintos React reutilizaría
         * el mismo elemento y seguiría reproduciendo el vídeo anterior: cambiar
         * el `<source>` de un vídeo ya cargado no dispara una carga nueva.
         */
        key={`${src}#${start}`}
        ref={videoRef}
        /**
         * `autoPlay` en el atributo, no un `play()` desde el efecto: así el
         * navegador arranca durante el PARSEO del HTML en lugar de esperar a
         * que React hidrate. Es la diferencia entre verlo al instante y verlo
         * medio segundo tarde.
         */
        autoPlay
        muted
        /**
         * El bucle se hace a mano en cuanto hay punto de entrada.
         *
         * El atributo `loop` vuelve siempre al cero, así que con él el vídeo
         * enseñaría el principio descartado en cada vuelta: bien la primera
         * pasada y mal todas las demás. Sin el atributo salta `ended`, y ahí
         * se rebobina al punto que toca.
         */
        loop={start === 0}
        onEnded={(event) => {
          if (start === 0) return;
          const video = event.currentTarget;
          video.currentTime = start;
          void video.play().catch(() => {});
        }}
        // Por si el navegador cargó los metadatos después de hidratar. No es
        // la defensa principal —esa va en la dirección y en el efecto—, pero
        // cuesta una línea y cubre el orden contrario.
        onLoadedMetadata={(event) => {
          if (start > 0 && event.currentTarget.currentTime < start) {
            event.currentTarget.currentTime = start;
          }
        }}
        playsInline
        // `auto`, no `metadata`: el vídeo es lo primero que se ve y su
        // descarga queda tapada por los ~2,8 s de la cortina de entrada, así
        // que arrancarla cuanto antes es justo lo que hace que no se espere.
        preload="auto"
        tabIndex={-1}
        /**
         * Sin puerta de opacidad. Antes el vídeo nacía invisible y solo se
         * mostraba al recibir `canplay` — pero ese evento se dispara ANTES de
         * que React hidrate, así que el escuchador llegaba tarde, el evento se
         * perdía y el vídeo se quedaba a opacidad 0 para siempre. Cargaba en
         * 13 ms y no se veía nunca.
         *
         * Ahora es visible desde el primer byte: mientras no haya fotograma
         * decodificado el elemento no pinta nada y se ve el color de base de
         * debajo, que es exactamente lo que debe verse.
         */
        className="absolute inset-0 h-full w-full object-cover"
      >
        {/*
          EL PUNTO DE ENTRADA VA EN LA DIRECCIÓN, como fragmento temporal.
          Es la única forma de que el navegador empiece donde toca SIN
          JavaScript: lo aplica al abrir el archivo, antes de que React
          hidrate, así que no hay un parpadeo del fotograma cero ni se depende
          de que un escuchador llegue a tiempo. El rebobinado del bucle sí es
          cosa nuestra, arriba.
        */}
        <source src={start > 0 ? `${src}#t=${start}` : src} type="video/mp4" />
      </video>

      <HeroScrim />
    </div>
  );
}

/**
 * Lo único que queda sobre el metraje.
 *
 * Aquí había un tinte plano y un barrido lateral que apagaban el vídeo entero
 * para salvar el texto del hero. Se retiraron: la legibilidad se resuelve
 * DONDE está el texto —con la sombra local de cada bloque— y no oscureciendo
 * el plano completo. El vídeo se ve limpio.
 *
 * La rejilla se queda porque no oscurece nada: es la misma trama de filetes
 * del sistema, a una opacidad en la que apenas se intuye, y sirve para
 * hilvanar el metraje con el lenguaje gráfico del resto del sitio.
 */
function HeroScrim() {
  return <div className="brand-grid absolute inset-0 opacity-30" />;
}
