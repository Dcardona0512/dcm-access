/* ============================================================================
   EL PIN DEL MAPA
   ----------------------------------------------------------------------------
   Vive aquí y no en cada mapa porque son DOS —el del formulario y el de la
   ficha— y tienen que ser el mismo: lo que el administrador coloca al publicar
   es exactamente lo que ve quien mira. Dos copias de este SVG acabarían con un
   pin dorado en un sitio y uno rojo en el otro.

   Lleva las siglas de la marca, como el de FincaRaíz lleva las suyas: sobre un
   mapa lleno de iconos ajenos —farmacias, gasolineras, cajeros— un marcador
   con nombre se distingue de un marcador cualquiera.

   Va en dorado de marca, y es una de las excepciones que la regla del acento
   permite: no es un relleno grande, es un objeto de catorce píxeles de ancho
   sobre un mapa claro, donde además es el color que mejor contrasta con el
   verde y el gris de OpenStreetMap.

   Las siglas van en tinta sobre el dorado, no en blanco: el dorado es claro y
   el blanco encima se lee mal.
   ========================================================================== */

const ORO = "#c9a96a";
const TINTA = "#08090a";

/**
 * El ancla va en la PUNTA, no en el centro.
 *
 * La punta es la que señala la coordenada; anclarlo al medio dejaría el punto
 * real media altura de marcador por debajo de donde se ve, que a zoom de calle
 * son unos veinte metros de error.
 */
export const PIN_SIZE: [number, number] = [46, 52];
export const PIN_ANCHOR: [number, number] = [23, 52];

export const PIN_HTML =
  `<svg viewBox="0 0 46 52" width="46" height="52" xmlns="http://www.w3.org/2000/svg">` +
  // Cuerpo y punta en un solo trazado: así el borde los rodea como una pieza
  // y no se ve la costura entre el rectángulo y el triángulo.
  `<path d="M8 0h30a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8H29l-6 16-6-16H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8Z" ` +
  `fill="${ORO}" stroke="rgba(0,0,0,.28)" stroke-width="1"/>` +
  `<text x="23" y="24" text-anchor="middle" fill="${TINTA}" ` +
  `font-family="system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" ` +
  `font-size="13" font-weight="700" letter-spacing="0.5">DCM</text>` +
  `</svg>`;
