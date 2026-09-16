/* ============================================================================
   TIPOGRAFÍA
   ----------------------------------------------------------------------------
   No se descarga ninguna fuente, y es a propósito.

   El referente es Amazon, y Amazon no sirve una fuente para la mayor parte de
   su interfaz: su hoja de estilos declara `"Amazon Ember", Arial`, y como
   Ember está licenciada solo para ellos, lo que de hecho renderiza el
   navegador en casi toda la página es Arial, a 14px con interlínea de 20px.
   Copiar esa tipografía no es buscarle un parecido a Ember: es usar Arial.

   Lo que se gana de paso: dos descargas menos, cero parpadeo al cargar y
   ningún texto que salte de una fuente a otra a mitad de pintado.

   `fontVariables` se conserva —vacío— porque los dos layouts raíz lo aplican
   al `<html>`. Volver a una fuente web es rellenar esta constante, no ir a
   buscar dónde se enganchaba.
   ========================================================================== */

export const fontVariables = "";
