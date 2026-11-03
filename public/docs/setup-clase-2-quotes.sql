-- ==============================================================================
-- VIBECODE LAB · CLASE 2: CONSTRUCCIÓN DEL MVP & AUTOMATIZACIONES
-- Script SQL para Supabase Editor (Copiar todo ➔ Clic en RUN)
-- ==============================================================================

-- ⚠️ ATENCIÓN ALUMNO:
-- Si tu proyecto no es de fletes, reemplaza la palabra "quotes"
-- por el nombre de tu tabla (ej: "leads", "tickets", "pedidos"):

CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    origin_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    floors_stairs INTEGER DEFAULT 0,
    items_description TEXT NOT NULL,
    estimated_total NUMERIC(10, 2) NOT NULL,
    breakdown_json JSONB NOT NULL,
    whatsapp_message TEXT NOT NULL,
    client_name TEXT,
    client_phone TEXT,
    status TEXT DEFAULT 'pending'
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Política 1: Permitir inserción anónima desde el formulario
CREATE POLICY "permitir_insercion_publica"
ON public.quotes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política 2: Permitir lectura pública de cotizaciones creadas
CREATE POLICY "permitir_lectura_publica"
ON public.quotes FOR SELECT
TO anon, authenticated
USING (true);
