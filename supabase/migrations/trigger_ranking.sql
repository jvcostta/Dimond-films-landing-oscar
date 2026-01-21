-- Atualiza o ranking automaticamente quando um nominee tem is_winner alterado

-- Função: recalcula todos os rankings (individual e grupos) usando tabelas existentes
CREATE OR REPLACE FUNCTION update_all_rankings()
RETURNS VOID AS $$
DECLARE
  r_group_bolao RECORD;
BEGIN
  -- Recalcular ranking para TODOS os bolões com base nos palpites e vencedores
  WITH scores AS (
    SELECT 
      bp.user_id,
      bp.bolao_id,
      bp.joined_at,
      COUNT(CASE WHEN n.is_winner THEN 1 END) AS points,
      BOOL_OR(CASE WHEN n.is_winner AND c.name = 'Melhor Filme' THEN true ELSE false END) AS best_film_correct,
      MIN(p.created_at) AS oldest_guess_date
    FROM bolao_participants bp
    LEFT JOIN palpites p 
      ON p.user_id = bp.user_id 
     AND p.bolao_id = bp.bolao_id
    LEFT JOIN nominees n 
      ON p.nominee_id = n.id
    LEFT JOIN categories c
      ON n.category_id = c.id
    GROUP BY bp.user_id, bp.bolao_id, bp.joined_at
  ),
  ranked AS (
    SELECT 
      user_id,
      bolao_id,
      points,
      ROW_NUMBER() OVER (
        PARTITION BY bolao_id
        ORDER BY points DESC, best_film_correct DESC, oldest_guess_date ASC
      ) AS position
    FROM scores
  )
  INSERT INTO ranking (
    user_id,
    bolao_id,
    points,
    position,
    updated_at
  )
  SELECT 
    user_id,
    bolao_id,
    points,
    position,
    NOW()
  FROM ranked
  ON CONFLICT (bolao_id, user_id)
  DO UPDATE SET
    points = EXCLUDED.points,
    position = EXCLUDED.position,
    updated_at = NOW();

  -- Recalcular rankings internos de cada grupo (usa função já existente)
  FOR r_group_bolao IN 
    SELECT id FROM boloes WHERE type = 'group'
  LOOP
    PERFORM recalculate_group_ranking(r_group_bolao.id);
  END LOOP;

  -- Atualizar ranking geral (usa função já existente)
  PERFORM recalculate_global_ranking();
END;
$$ LANGUAGE plpgsql;

-- Substitui a função de ranking por grupo para aplicar os critérios de desempate
CREATE OR REPLACE FUNCTION recalculate_group_ranking(p_bolao_id UUID)
RETURNS VOID AS $$
DECLARE
  participant RECORD;
  current_position INTEGER := 0;
  previous_points INTEGER := -1;
  previous_best_film BOOLEAN := false;
  previous_oldest TIMESTAMP WITH TIME ZONE := NULL;
  counter INTEGER := 0;
BEGIN
  WITH scores AS (
    SELECT 
      bp.user_id,
      COUNT(CASE WHEN n.is_winner THEN 1 END) AS points,
      BOOL_OR(CASE WHEN n.is_winner AND c.name = 'Melhor Filme' THEN true ELSE false END) AS best_film_correct,
      MIN(p.created_at) AS oldest_guess_date
    FROM bolao_participants bp
    LEFT JOIN palpites p 
      ON p.user_id = bp.user_id 
     AND p.bolao_id = p_bolao_id
    LEFT JOIN nominees n 
      ON p.nominee_id = n.id
    LEFT JOIN categories c
      ON n.category_id = c.id
    WHERE bp.bolao_id = p_bolao_id
    GROUP BY bp.user_id
  ), ranked AS (
    SELECT 
      user_id,
      points,
      best_film_correct,
      oldest_guess_date,
      ROW_NUMBER() OVER (
        ORDER BY points DESC, best_film_correct DESC, oldest_guess_date ASC
      ) AS position
    FROM scores
  )
  INSERT INTO group_rankings (user_id, bolao_id, points, position, updated_at)
  SELECT r.user_id, p_bolao_id, r.points, r.position, NOW()
  FROM ranked r
  ON CONFLICT (user_id, bolao_id) 
  DO UPDATE SET 
    points = EXCLUDED.points,
    position = EXCLUDED.position,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Substitui a função de ranking global para aplicar os critérios de desempate
CREATE OR REPLACE FUNCTION recalculate_global_ranking()
RETURNS VOID AS $$
DECLARE
  global_ranking_id UUID;
BEGIN
  SELECT id INTO global_ranking_id
  FROM boloes
  WHERE name = 'Ranking Geral' AND type = 'individual'
  LIMIT 1;
  
  IF global_ranking_id IS NULL THEN
    RAISE EXCEPTION 'Ranking Geral não encontrado';
  END IF;

  -- Limpa ranking do global e dos grupos que serão rehidratados
  DELETE FROM ranking WHERE bolao_id = global_ranking_id;
  DELETE FROM ranking WHERE bolao_id IN (SELECT id FROM boloes WHERE type = 'group');

  -- Recalcula ranking global com os critérios de desempate
  WITH scores AS (
    SELECT 
      bp.user_id,
      COUNT(CASE WHEN n.is_winner THEN 1 END) AS points,
      BOOL_OR(CASE WHEN n.is_winner AND c.name = 'Melhor Filme' THEN true ELSE false END) AS best_film_correct,
      MIN(p.created_at) AS oldest_guess_date
    FROM bolao_participants bp
    LEFT JOIN palpites p 
      ON p.user_id = bp.user_id 
     AND p.bolao_id = global_ranking_id
    LEFT JOIN nominees n 
      ON p.nominee_id = n.id
    LEFT JOIN categories c
      ON n.category_id = c.id
    WHERE bp.bolao_id = global_ranking_id
    GROUP BY bp.user_id
  ), ranked AS (
    SELECT 
      user_id,
      points,
      best_film_correct,
      oldest_guess_date,
      ROW_NUMBER() OVER (
        ORDER BY points DESC, best_film_correct DESC, oldest_guess_date ASC
      ) AS position
    FROM scores
  )
  INSERT INTO ranking (user_id, bolao_id, points, position, updated_at)
  SELECT user_id, global_ranking_id, points, position, NOW()
  FROM ranked;

  -- Rehidrata ranking para cada grupo com a posição do usuário no global
  INSERT INTO ranking (user_id, bolao_id, points, position, updated_at)
  SELECT gr.user_id, b.id AS bolao_id, gr.points, r.position, NOW()
  FROM group_rankings gr
  JOIN boloes b ON gr.bolao_id = b.id AND b.type = 'group'
  JOIN ranking r ON r.user_id = gr.user_id AND r.bolao_id = global_ranking_id
  WHERE gr.position = 1
  ON CONFLICT (bolao_id, user_id) DO UPDATE SET
    points = EXCLUDED.points,
    position = EXCLUDED.position,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger: ao alterar is_winner em nominees, recalcula tudo
CREATE OR REPLACE FUNCTION trigger_update_rankings_on_winner_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.is_winner IS DISTINCT FROM NEW.is_winner) THEN
    PERFORM update_all_rankings();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_rankings_on_winner_change ON nominees;
CREATE TRIGGER update_rankings_on_winner_change
  AFTER UPDATE OF is_winner ON nominees
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_rankings_on_winner_change();
