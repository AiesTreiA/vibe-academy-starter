import { promises as dnsPromises } from "dns"
import { validateEmailClient } from "./email-validator-client"

export * from "./email-validator-client"

/**
 * Valida un correo en el servidor, incluyendo verificación de sintaxis, dominios desechables
 * y consulta DNS para asegurar que el dominio tiene servidores de correo activos (registros MX).
 */
export async function verifyEmailMx(email: string): Promise<{ isValid: boolean; reason?: string }> {
  // Primero aplicamos las validaciones rápidas de sintaxis y desechables
  const clientValidation = validateEmailClient(email)
  if (!clientValidation.isValid) {
    return clientValidation
  }

  const cleanEmail = email.trim()
  const domain = cleanEmail.split("@")[1]?.toLowerCase()

  if (!domain) {
    return { isValid: false, reason: "El dominio del correo no es válido." }
  }

  try {
    // Buscar los registros MX (Mail Exchange) del dominio
    console.log(`🔍 Consultando registros MX para el dominio: ${domain}`)
    const mxRecords = await dnsPromises.resolveMx(domain)
    
    if (!mxRecords || mxRecords.length === 0) {
      return { 
        isValid: false, 
        reason: `No se encontró una dirección válida ni un servidor de correo activo para el dominio @${domain}. Por favor, verifica si escribiste bien tu correo.` 
      }
    }

    return { isValid: true }
  } catch (error: any) {
    console.warn(`⚠️ Error al consultar registros MX de ${domain}:`, error.message || error)

    // Si el dominio no existe (ENOTFOUND) o no tiene registros de ningún tipo (ENODATA),
    // podemos dar por hecho que no puede recibir correos.
    if (error.code === "ENOTFOUND" || error.code === "ENODATA") {
      return { 
        isValid: false, 
        reason: `El dominio @${domain} no existe o no puede recibir correos. Por favor, verifica que escribiste bien tu correo.` 
      }
    }

    // Para otros errores de infraestructura (como timeout o fallas temporales de DNS local),
    // somos permisivos para no bloquear a usuarios legítimos por problemas del servidor.
    return { isValid: true }
  }
}
