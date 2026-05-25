/* ==========================================================
   CONFIGURACIÓN DE SUPABASE
   ----------------------------------------------------------
   1. Crea un proyecto en https://supabase.com
   2. En "Project Settings → API" copia:
        - Project URL          → SUPABASE_URL
        - anon / public key    → SUPABASE_ANON_KEY
   3. En "SQL Editor" corre el script de supabase-schema.sql
      (incluido en este repo)
   ========================================================== */

const SUPABASE_URL      = 'TU_SUPABASE_URL_AQUI';      // ej: https://xxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY_AQUI'; // ej: eyJhbGciOi...

/**
 * Si las credenciales no están configuradas, la app funcionará igual
 * pero los registros NO se guardarán en la base de datos.
 * Esto permite probar el quiz antes de configurar Supabase.
 */
const SUPABASE_CONFIGURED =
  SUPABASE_URL !== 'TU_SUPABASE_URL_AQUI' &&
  SUPABASE_ANON_KEY !== 'TU_SUPABASE_ANON_KEY_AQUI';
