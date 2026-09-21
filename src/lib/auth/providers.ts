import "server-only";

/* ============================================================================
   QUÉ PROVEEDORES DE ACCESO ESTÁN CONECTADOS
   ----------------------------------------------------------------------------
   SE LE PREGUNTA A SUPABASE, no se declara aquí.

   La primera versión lo decidía con una variable de entorno, y eso obligaba a
   tres pasos para encender un botón: crear las credenciales, pegarlas en
   Supabase y además acordarse de poner la variable y redesplegar. Preguntando,
   el botón aparece SOLO el día que se habilita el proveedor, y desaparece solo
   el día que se apaga.

   Importa que no aparezca antes de tiempo: el botón de un proveedor sin
   habilitar no da un error nuestro, se va al dominio de Supabase y deja a la
   persona mirando un JSON.

   Si la consulta falla, se responde que no. Es mejor no ofrecer el botón que
   ofrecer uno que no lleva a ninguna parte.
   ========================================================================== */

type Ajustes = { external?: Record<string, boolean> };

export async function googleHabilitado(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return false;

  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      /*
        Cinco minutos de caché. Sin ella, cada visita a la entrada dispara una
        petición a Supabase para responder algo que cambia una vez al año; con
        más, encender el botón tardaría en notarse y parecería que no funcionó.
      */
      next: { revalidate: 300 },
    });

    if (!res.ok) return false;

    const ajustes = (await res.json()) as Ajustes;
    return ajustes.external?.google === true;
  } catch {
    return false;
  }
}
