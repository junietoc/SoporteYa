CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT NOT NULL,
  category TEXT, -- se llena con el agente
  sentiment TEXT,
  processed BOOLEAN DEFAULT FALSE
);

-- para soporte en tiempo real
alter publication supabase_realtime add table tickets;

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON tickets FOR ALL USING (true);