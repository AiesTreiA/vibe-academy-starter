/**
 * Validaciones de correo electrónico seguras para ejecutar en el cliente (navegador).
 */

// Lista de dominios de correo temporal o desechable más comunes
export const DISPOSABLE_DOMAINS = [
  "yopmail.com", "yopmail.fr", "yopmail.net", "cool.fr.to", "jetable.fr.nf", "nou.ch",
  "nomail.xl.cx", "mega.zippy.cjb.net", "speed.1s.fr", "courriel.fr.nf", "moncourriel.fr.nf",
  "monemail.fr.nf", "monmail.fr.nf", "mailinator.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "guerrillamail.com", "sharklasers.com", "dispostable.com", "getairmail.com",
  "maildrop.cc", "mailnesia.com", "mailcatch.com", "trashmail.com", "guerrillamailblock.com",
  "guerrillamail.net", "guerrillamail.org", "guerrillamail.biz", "spam4.me", "grr.la",
  "guerrillamail.de", "tempmailaddress.com", "disposable.com", "tempmail.net", "fakeinbox.com",
  "getnada.com", "throwawaymail.com", "tempmailo.com"
]

/**
 * Valida la sintaxis del correo usando una expresión regular estricta.
 */
export function isValidEmailSyntax(email: string): boolean {
  if (!email) return false
  
  // Expresión regular estándar y estricta para validación de formato
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!regex.test(email)) return false

  // Chequeos adicionales: evitar espacios y puntos consecutivos en cualquier parte
  if (email.includes(" ") || email.includes("..")) return false

  return true
}

/**
 * Verifica si un correo pertenece a un dominio desechable o temporal.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email) return true
  
  const parts = email.split("@")
  if (parts.length !== 2) return true
  
  const domain = parts[1].toLowerCase().trim()
  
  return DISPOSABLE_DOMAINS.some(disposable => {
    return domain === disposable || domain.endsWith("." + disposable)
  })
}

/**
 * Ejecuta todas las validaciones disponibles en el cliente.
 */
export function validateEmailClient(email: string): { isValid: boolean; reason?: string } {
  const cleanEmail = email.trim()
  
  if (!isValidEmailSyntax(cleanEmail)) {
    return { isValid: false, reason: "El formato del correo electrónico no es válido." }
  }
  
  if (isDisposableEmail(cleanEmail)) {
    return { isValid: false, reason: "No se permiten correos electrónicos temporales o desechables." }
  }
  
  return { isValid: true }
}
