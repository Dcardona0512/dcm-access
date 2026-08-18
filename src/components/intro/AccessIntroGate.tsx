/* ============================================================================
   GUARDIÁN DE LA INTRODUCCIÓN
   ----------------------------------------------------------------------------
   Marca el documento solo en la primera visita de la sesión, y lo hace ANTES
   de que se pinte nada. De ahí salen tres garantías: sin JavaScript la
   introducción no existe y la página se ve normal; en visitas repetidas no hay
   ni un fotograma de cortina; y no hay destello del contenido antes de que
   aparezca el overlay.

   POR QUÉ NO ES UNA ETIQUETA `<script>` NI `next/script`
   ------------------------------------------------------
   React 19 avisa —con razón— siempre que un componente renderiza un `<script>`
   con contenido en línea: en los renders de cliente no se ejecutan nunca. El
   aviso salta igual con `next/script` y `beforeInteractive`, y da lo mismo que
   el componente sea de servidor: la etiqueta acaba en el árbol de React.

   La salida es no darle a React ningún `<script>` que reconciliar. Lo que ve
   es un `<div>` con `dangerouslySetInnerHTML`; el script viaja DENTRO de ese
   HTML, así que:

     · en la carga inicial el navegador lo encuentra al parsear y lo ejecuta
       de forma bloqueante, antes de pintar — que es justo lo que hace falta;
     · en cliente React nunca crea un elemento `<script>`, así que no hay
       aviso, y `suppressHydrationWarning` evita que compare el contenido.

   Que en una navegación de cliente no se ejecute es irrelevante: solo tiene
   sentido en la carga inicial del documento, que es cuando corre.
   ========================================================================== */

/** Se ejecuta durante el parseo. Sin dependencias, sin esperar a nada. */
const GATE_SCRIPT = `try{if(!sessionStorage.getItem("dcm_intro")){document.documentElement.dataset.intro="in";sessionStorage.setItem("dcm_intro","1")}}catch(e){}`;

export function AccessIntroGate() {
  return (
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: `<script>${GATE_SCRIPT}</script>` }}
    />
  );
}
