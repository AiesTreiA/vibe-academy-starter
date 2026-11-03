# 📌 Fe de Erratas – Clase 3: Privacidad y Cifrado en Google Drive

> [!WARNING]
> **Aclaración Importante sobre el Modelo de Seguridad y Privacidad de Google Drive**
> 
> En la sesión de la **Clase 3 (Autenticación Segura, RLS & Google OAuth)**, se mencionó un punto sobre la privacidad y el cifrado de archivos en Google Drive que requiere una precisión técnica fundamental.

---

## 🔍 La Aclaración Técnica

Aunque todos los archivos en Google Drive están cifrados tanto **en tránsito** (mientras se transfieren mediante TLS/HTTPS) como **en reposo** (guardados en los servidores mediante cifrado AES-256 o equivalente), **Google mantiene la custodia y el control de las claves de cifrado por defecto** (*Google-managed keys*).

### ⚖️ Implicancias de Privacidad y Legales
- **Acceso por orden legal:** Al tener la custodia de las claves criptográficas, Google tiene la capacidad técnica de descifrar y entregar la información requerida si se le presenta una orden judicial válida o requerimiento legal fundado.
- **No es Zero-Knowledge por defecto:** A diferencia de plataformas de conocimiento cero (donde solo el usuario posee la llave), el servicio estándar de Google Drive permite a sus sistemas descifrar el contenido para procesamiento e indexación.

---

## 🔐 ¿Cómo lograr acceso y control exclusivo?

La única forma de garantizar que **nadie** (ni siquiera Google ni terceros con requerimientos judiciales dirigidos a Google) pueda acceder al contenido de los archivos es mediante:

### **Cifrado del lado del cliente (*Client-Side Encryption / CSE*)**
- **Disponibilidad:** Disponible en planes empresariales y educativos corporativos de **Google Workspace**.
- **Funcionamiento:** Los datos se cifran en el dispositivo del usuario antes de enviarse a la nube de Google, utilizando llaves gestionadas por un servicio externo de control de claves (*Key Access Service Control / KASC*) bajo control total de la organización.

---

## 📚 Resumen Comparativo

| Característica | Google Drive Estándar | Google Workspace con CSE (*Client-Side Encryption*) |
| :--- | :--- | :--- |
| **Cifrado en Tránsito (TLS)** | ✅ Sí | ✅ Sí |
| **Cifrado en Reposo (AES)** | ✅ Sí | ✅ Sí |
| **Custodia de Claves** | 🏢 Google (*Google-managed*) | 👤 El Cliente / Organización (*Customer-managed*) |
| **Capacidad de descifrado ante orden judicial a Google** | ⚠️ Sí, Google puede descifrar los datos | 🛡️ No, Google no posee la llave para descifrar |
| **Cifrado Zero-Knowledge** | ❌ No | ✅ Sí |

---

*Publicado en el Centro de Recursos de Vibecode Lab.*
