/**
 * Vibecode Lab - Doctor CLI (doctor.js)
 * Ejecución: node doctor.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHECKS = [
  { name: 'Node.js (>= v20)', cmd: 'node -v', minMajor: 20 },
  { name: 'npm', cmd: 'npm -v' },
  { name: 'Git', cmd: 'git --version' },
  { name: 'Python (>= 3.11)', cmd: 'python --version || python3 --version', minMajor: 3, minMinor: 11 },
  { name: 'Go (>= 1.22)', cmd: 'go version', minMajor: 1, minMinor: 22 },
  { name: 'Antigravity CLI (agy)', cmd: 'agy --version || antigravity --version' },
  { name: 'PostgreSQL (Opcional)', cmd: 'psql --version', optional: true },
];

console.log('\n🔍 --- [ Vibecode Lab: Diagnóstico de Entorno ] ---\n');

let hasErrors = false;

for (const check of CHECKS) {
  try {
    const output = execSync(check.cmd, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf-8' }).trim();
    console.log(`\x1b[32m✔ [OK]\x1b[0m ${check.name.padEnd(24)} -> ${output.split('\n')[0]}`);
  } catch (err) {
    if (check.optional) {
      console.log(`\x1b[33m⚠ [AVISO]\x1b[0m ${check.name.padEnd(21)} -> No detectado (Opcional)`);
    } else {
      console.log(`\x1b[31m✖ [ERROR]\x1b[0m ${check.name.padEnd(21)} -> No instalado o no está en el PATH`);
      hasErrors = true;
    }
  }
}

// Verificación de archivo de variables de entorno (.env)
console.log('\n🔒 --- [ Verificación de Credenciales ] ---');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasGemini = /GEMINI_API_KEY=.+/.test(envContent);
  const hasSupabase = /SUPABASE_URL=.+/.test(envContent);

  console.log(`\x1b[32m✔ [OK]\x1b[0m Archivo .env detectado`);
  console.log(hasGemini ? `\x1b[32m✔ [OK]\x1b[0m GEMINI_API_KEY configurada` : `\x1b[33m⚠ [PENDIENTE]\x1b[0m GEMINI_API_KEY vacía`);
  console.log(hasSupabase ? `\x1b[32m✔ [OK]\x1b[0m SUPABASE_URL configurada` : `\x1b[33m⚠ [PENDIENTE]\x1b[0m SUPABASE_URL vacía`);
} else {
  console.log(`\x1b[33m⚠ [PENDIENTE]\x1b[0m No se encontró archivo .env en el directorio actual.`);
}

console.log('\n-------------------------------------------------');
if (hasErrors) {
  console.log('\x1b[31m⛔ Tienes herramientas obligatorias faltantes. Pide soporte en el chat.\x1b[0m\n');
} else {
  console.log('\x1b[32m🚀 ¡Entorno 100% listo para construir en Vibecode Lab!\x1b[0m\n');
}
