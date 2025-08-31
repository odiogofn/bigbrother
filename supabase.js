// supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 🔑 coloque aqui os dados do seu projeto:
const SUPABASE_URL = "https://biojnilbgzozmynemtra.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpb2puaWxiZ3pvem15bmVtdHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDM5MzEsImV4cCI6MjA3MjIxOTkzMX0.F8MyL33SdQ7RViOF5RWgoZh8vC6hsyNqmqUXmRcNPDM"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)