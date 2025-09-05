// supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// CONFIG SUA
export const supabase = createClient(
  "https://biojnilbgzozmynemtra.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpb2puaWxiZ3pvem15bmVtdHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDM5MzEsImV4cCI6MjA3MjIxOTkzMX0.F8MyL33SdQ7RViOF5RWgoZh8vC6hsyNqmqUXmRcNPDM"
);
