import { randomUUID } from "node:crypto";

import { AdminHeading } from "@/components/admin/AdminUI";
import { cuentaDe, publicaciones } from "@/lib/data/supabase/social";

import { ConectarInstagram } from "./ConectarInstagram";
import { Publicaciones } from "./Publicaciones";
import { SubirVideo } from "./SubirVideo";

/* ============================================================================
   REDES
   ----------------------------------------------------------------------------
   El puesto de mando: se sube el vídeo una vez, se escribe el pie una vez, y
   desde aquí sale a las redes.

   Instagram se publica de verdad, por su API. TikTok todavía no: su API exige
   pasar una revisión que tarda semanas y que, según su propia documentación,
   no aprueban productos a medio hacer. Mientras tanto aparece como destino «a
   mano», con el vídeo y el texto preparados — que es lo honesto, y deja la
   pantalla lista para el día que se enchufe el motor detrás.
   ========================================================================== */

export const dynamic = "force-dynamic";

/**
 * Días que faltan para una fecha. Se resuelve aquí y no en el navegador: la
 * página ya se renderiza en cada visita, y así el componente de la cuenta no
 * necesita ni reloj ni efecto.
 */
function diasHasta(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export default async function AdminSocialPage() {
  const [instagram, lista] = await Promise.all([cuentaDe("instagram"), publicaciones()]);

  /*
    El identificador se acuña en el SERVIDOR y viaja como prop: es la carpeta
    del almacenamiento y la clave de la publicación. Generarlo en el navegador
    daría uno distinto en el render del servidor y en el del cliente.

    UUID ENTERO, no uno acortado y con prefijo como el de las fichas: aquí la
    columna `id` es de tipo uuid, y un `post-a1b2c3` se rechazaría al guardar
    —después de haber subido el vídeo, que es el peor momento posible para
    enterarse—.
  */
  const postId = randomUUID();

  return (
    <>
      <AdminHeading
        title="Redes"
        lede="Un vídeo, un texto, y de aquí sale a Instagram y a TikTok."
      />

      <div className="flex flex-col gap-12">
        <ConectarInstagram
          cuenta={
            instagram
              ? { username: instagram.username, dias: diasHasta(instagram.tokenExpiresAt) }
              : null
          }
        />

        {instagram ? <SubirVideo postId={postId} /> : null}

        <Publicaciones lista={lista} />
      </div>
    </>
  );
}
