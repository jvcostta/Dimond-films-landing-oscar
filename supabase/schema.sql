-- ============================================
-- BOLÃO DO OSCAR - DATABASE SCHEMA
-- ============================================

-- Extension para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: users
-- Dados pessoais dos usuários
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE NOT NULL, -- Referência ao Supabase Auth
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  state VARCHAR(2), -- UF do estado
  city VARCHAR(100),
  birth_date DATE,
  favorite_genre VARCHAR(100),
  cinema_network VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: boloes
-- Bolões individuais ou em grupo
-- ============================================
CREATE TABLE IF NOT EXISTS boloes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('individual', 'group')), -- individual ou group
  invite_code VARCHAR(50) UNIQUE, -- Código para entrar no bolão (apenas para groups)
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: bolao_participants
-- Usuários participantes de cada bolão
-- ============================================
CREATE TABLE IF NOT EXISTS bolao_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bolao_id UUID NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bolao_id, user_id) -- Um usuário não pode entrar duas vezes no mesmo bolão
);

-- ============================================
-- TABELA: categories
-- Categorias do Oscar
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: nominees
-- Indicados por categoria
-- ============================================
CREATE TABLE IF NOT EXISTS nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  movie VARCHAR(255),
  is_winner BOOLEAN DEFAULT FALSE, -- Define se é o vencedor oficial
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: palpites
-- Palpites dos usuários por bolão e categoria
-- ============================================
CREATE TABLE IF NOT EXISTS palpites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bolao_id UUID NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  nominee_id UUID NOT NULL REFERENCES nominees(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bolao_id, user_id, category_id) -- Um palpite por categoria por bolão
);

-- ============================================
-- TABELA: ranking
-- Ranking calculado por bolão (view materializada ou tabela)
-- ============================================
CREATE TABLE IF NOT EXISTS ranking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bolao_id UUID NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  position INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bolao_id, user_id)
);

-- ============================================
-- TABELA: group_rankings
-- Ranking interno de cada grupo
-- ============================================
CREATE TABLE IF NOT EXISTS group_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bolao_id UUID NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT group_rankings_user_bolao_unique UNIQUE (user_id, bolao_id)
);

-- ============================================
-- TABELA: tiebreaker_answers
-- Respostas da pergunta de desempate
-- ============================================
CREATE TABLE IF NOT EXISTS tiebreaker_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bolao_id UUID NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bolao_id, user_id)
);

-- ============================================
-- ÍNDICES para performance
-- ============================================
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_boloes_type ON boloes(type);
CREATE INDEX idx_boloes_invite_code ON boloes(invite_code);
CREATE INDEX idx_bolao_participants_bolao ON bolao_participants(bolao_id);
CREATE INDEX idx_bolao_participants_user ON bolao_participants(user_id);
CREATE INDEX idx_nominees_category ON nominees(category_id);
CREATE INDEX idx_palpites_bolao ON palpites(bolao_id);
CREATE INDEX idx_palpites_user ON palpites(user_id);
CREATE INDEX idx_ranking_bolao ON ranking(bolao_id);
CREATE INDEX idx_group_rankings_bolao ON group_rankings(bolao_id);
CREATE INDEX idx_group_rankings_user ON group_rankings(user_id);
CREATE INDEX idx_group_rankings_points ON group_rankings(points DESC);
CREATE INDEX idx_group_rankings_bolao_points ON group_rankings(bolao_id, points DESC);
CREATE INDEX idx_tiebreaker_bolao ON tiebreaker_answers(bolao_id);
CREATE INDEX idx_tiebreaker_user ON tiebreaker_answers(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_rankings_updated_at BEFORE UPDATE ON group_rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tiebreaker_updated_at BEFORE UPDATE ON tiebreaker_answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boloes_updated_at BEFORE UPDATE ON boloes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_palpites_updated_at BEFORE UPDATE ON palpites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Função para gerar invite_code único
-- ============================================
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;por bolão
-- ============================================
CREATE OR REPLACE FUNCTION calcular_pontos_bolao(p_user_id UUID, p_bolao_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_pontos INTEGER := 0;
BEGIN
  SELECT COALESCE(COUNT(*), 0)
  INTO total_pontos
  FROM palpites p
  JOIN nominees n ON p.nominee_id = n.id
  WHERE p.user_id = p_user_id
    AND p.bolao_id = p_bolao_id
    AND n.is_winner = true;
  
  RETURN total_pontos;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Função para recalcular ranking de um grupo
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_group_ranking(p_bolao_id UUID)
RETURNS VOID AS $$
DECLARE
  participant RECORD;
  current_position INTEGER := 0;
  previous_points INTEGER := -1;
  counter INTEGER := 0;
BEGIN
  FOR participant IN
    SELECT 
      bp.user_id,
      u.name,
      calcular_pontos_bolao(bp.user_id, p_bolao_id) as points
    FROM bolao_participants bp
    JOIN users u ON bp.user_id = u.id
    WHERE bp.bolao_id = p_bolao_id
    ORDER BY calcular_pontos_bolao(bp.user_id, p_bolao_id) DESC, bp.joined_at ASC
  LOOP
    counter := counter + 1;
    
    IF participant.points != previous_points THEN
      current_position := counter;
      previous_points := participant.points;
    END IF;
    
    INSERT INTO group_rankings (user_id, bolao_id, points, position, updated_at)
    VALUES (participant.user_id, p_bolao_id, participant.points, current_position, NOW())
    ON CONFLICT (user_id, bolao_id) 
    DO UPDATgroup_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiebreaker_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE E SET 
      points = EXCLUDED.points,
      position = EXCLUDED.position,
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Função para recalcular ranking geral
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_global_ranking()
RETURNS VOID AS $$
DECLARE
  global_ranking_id UUID;
  participant RECORD;
  current_position INTEGER := 0;
  previous_points INTEGER := -1;
  counter INTEGER := 0;
  group_record RECORD;
  user_individual_position INTEGER;
BEGIN
  SELECT id INTO global_ranking_id
  FROM boloes
  WHERE name = 'Ranking Geral' AND type = 'individual'
  LIMIT 1;
  
  IF global_ranking_id IS NULL THEN
    RAISE EXCEPTION 'Ranking Geral não encontrado';
  END IF;
  
  DELETE FROM ranking WHERE bolao_id = global_ranking_id;
  DELETE FROM ranking WHERE bolao_id IN (SELECT id FROM boloes WHERE type = 'group');
  
  counter := 0;
  current_position := 0;
  previous_points := -1;
  
  FOR participant IN
    SELECT 
      bp.user_id,
      u.name,
      calcular_pontos_bolao(bp.user_id, global_ranking_id) as points
    FROM bolao_participants bp
    JOIN users u ON bp.user_id = u.id
    WHERE bp.bolao_id = global_ranking_id
    ORDER BY calcular_pontos_bolao(bp.user_id, global_ranking_id) DESC, u.name ASC
  LOOP
    counter := counter + 1;
    
    IF participant.points != previous_points THEN
      current_position := counter;
      previous_points := participant.points;
    END IF;
    
    INSERT INTO ranking (user_id, bolao_id, points, position, updated_at)
    VALUES (participant.user_id, global_ranking_id, participant.points, current_position, NOW());
  END LOOP;
  
  FOR group_record IN
    SELECT 
      b.id as bolao_id,
      b.name as bolao_name,
      gr.user_id,
      u.name as user_name,
      gr.points
    FROM group_rankings gr
    JOIN users u ON gr.user_id = u.id
    JOIN boloes b ON gr.bolao_id = b.id
    WHERE gr.position = 1 AND b.type = 'group'
    ORDER BY gr.points DESC, u.name ASC
  LOOP
    SELECT r.position INTO user_individual_position
    FROM ranking r
    WHERE r.user_id = group_record.user_id 
      AND r.bolao_id = global_ranking_id;
    
    IF user_individual_position IS NOT NULL THEN
      INSERT INTO ranking (user_id, bolao_id, points, position, updated_at)
      VALUES (group_record.user_id, group_record.bolao_id, group_record.points, user_individual_position, NOW());
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger para atualizar ranking geral automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION trigger_update_global_ranking()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_global_ranking();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_update_global_ranking ON group_rankings;

CREATE TRIGGER auto_update_global_ranking
  AFTER INSERT OR UPDATE OR DELETE ON group_rankings
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_update_global_ranking()
  UPDATE ranking r
  SET position = ranked.pos
  FROM ranked
  WHERE r.id = ranked.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilita RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boloes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bolao_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE palpites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTA: Políticas configuradas para DESENVOLVIMENTO
-- Para PRODUÇÃO, ajustar para usar auth.uid() adequadamente
-- ============================================

-- Policies para users: leitura pública (para desenvolvimento)
CREATE POLICY "Public read access to users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true);

-- Policies para categories e nominees: leitura pública
CREATE POLICY "Public read access to categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access to nominees" ON nominees
  FOR SELECT USING (true);

-- Policies para boloes: leitura pública por invite_code
CREATE POLICY "Public read access to boloes by invite_code" ON boloes
  FOR SELECT USING (invite_code IS NOT NULL);

CREATE POLICY "Users can create boloes" ON boloes
  FOR INSERT WITH CHECK (true);

-- Policies para bolao_participants: acesso público para desenvolvimento
CREATE POLICY "Public insert access to bolao_participants" ON bolao_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access to bolao_participants" ON bolao_participants
  FOR SELECT USING (true);

-- Policies para palpites: acesso público para desenvolvimento
CREATE POLICY "Public insert access to palpites" ON palpites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access to palpites" ON palpites
  FOR UPDATE USING (true);

CREATE POLICY "Public read access to palpites" ON palpites
  FOR SELECT USING (true);

-- Policies para ranking: 

-- Policies para group_rankings: leitura pública
CREATE POLICY "Public read access to group_rankings" ON group_rankings
  FOR SELECT USING (true);

-- Policies para tiebreaker_answers: acesso público para desenvolvimento
CREATE POLICY "Public insert access to tiebreaker_answers" ON tiebreaker_answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access to tiebreaker_answers" ON tiebreaker_answers
  FOR UPDATE USING (true);

CREATE POLICY "Public read access to tiebreaker_answers" ON tiebreaker_answers
  FOR SELECT USING (true);leitura pública
CREATE POLICY "Public read access to ranking" ON ranking
  FOR SELECT USING (true);
