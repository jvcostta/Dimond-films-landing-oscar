-- ============================================
-- SEED DATA: Categorias e Indicados Oscar 2026
-- ============================================

-- Inserir Categorias
INSERT INTO categories (name, display_order) VALUES
('Melhor Filme', 1),
('Melhor Direção', 2),
('Melhor Atriz', 3),
('Melhor Ator', 4),
('Melhor Atriz Coadjuvante', 5),
('Melhor Ator Coadjuvante', 6),
('Melhor Roteiro Original', 7),
('Melhor Roteiro Adaptado', 8),
('Melhor Filme Internacional', 9),
('Melhor Animação', 10),
('Melhor Documentário', 11),
('Melhor Fotografia', 12),
('Melhor Montagem', 13),
('Melhor Desenho de Produção', 14),
('Melhor Figurino', 15),
('Melhor Trilha Sonora', 16),
('Melhor Canção Original', 17),
('Melhor Som', 18),
('Melhores Efeitos Visuais', 19),
('Melhor Maquiagem e Cabelo', 20),
('Melhor Curta-Metragem', 21),
('Melhor Curta de Animação', 22),
('Melhor Curta Documentário', 23)
ON CONFLICT (name) DO NOTHING;

-- Inserir Indicados

-- Melhor Filme
INSERT INTO nominees (category_id, name, movie) 
SELECT id, 'Anora', 'Anora' FROM categories WHERE name = 'Melhor Filme'
UNION ALL
SELECT id, 'O Brutalista', 'O Brutalista' FROM categories WHERE name = 'Melhor Filme'
UNION ALL
SELECT id, 'Um Completo Desconhecido', 'Um Completo Desconhecido' FROM categories WHERE name = 'Melhor Filme'
UNION ALL
SELECT id, 'Cônclave', 'Cônclave' FROM categories WHERE name = 'Melhor Filme'
UNION ALL
SELECT id, 'Duna: Parte Dois', 'Duna: Parte Dois' FROM categories WHERE name = 'Melhor Filme'
UNION ALL
SELECT id, 'Emília Pérez', 'Emília Pérez' FROM categories WHERE name = 'Melhor Filme'
UNION ALL
SELECT id, 'Eu Ainda Estou Aqui', 'Eu Ainda Estou Aqui' FROM categories WHERE name = 'Melhor Filme'
UNION ALL
SELECT id, 'Nickel Boys', 'Nickel Boys' FROM categories WHERE name = 'Melhor Filme'
UNION ALL
SELECT id, 'A Substância', 'A Substância' FROM categories WHERE name = 'Melhor Filme'
UNION ALL
SELECT id, 'Wicked', 'Wicked' FROM categories WHERE name = 'Melhor Filme';

-- Melhor Direção
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Sean Baker', 'Anora' FROM categories WHERE name = 'Melhor Direção'
UNION ALL
SELECT id, 'Brady Corbet', 'O Brutalista' FROM categories WHERE name = 'Melhor Direção'
UNION ALL
SELECT id, 'James Mangold', 'Um Completo Desconhecido' FROM categories WHERE name = 'Melhor Direção'
UNION ALL
SELECT id, 'Jacques Audiard', 'Emília Pérez' FROM categories WHERE name = 'Melhor Direção'
UNION ALL
SELECT id, 'Coralie Fargeat', 'A Substância' FROM categories WHERE name = 'Melhor Direção';

-- Melhor Atriz
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Cynthia Erivo', 'Wicked' FROM categories WHERE name = 'Melhor Atriz'
UNION ALL
SELECT id, 'Karla Sofía Gascón', 'Emília Pérez' FROM categories WHERE name = 'Melhor Atriz'
UNION ALL
SELECT id, 'Mikey Madison', 'Anora' FROM categories WHERE name = 'Melhor Atriz'
UNION ALL
SELECT id, 'Demi Moore', 'A Substância' FROM categories WHERE name = 'Melhor Atriz'
UNION ALL
SELECT id, 'Fernanda Torres', 'Eu Ainda Estou Aqui' FROM categories WHERE name = 'Melhor Atriz';

-- Melhor Ator
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Adrien Brody', 'O Brutalista' FROM categories WHERE name = 'Melhor Ator'
UNION ALL
SELECT id, 'Timothée Chalamet', 'Um Completo Desconhecido' FROM categories WHERE name = 'Melhor Ator'
UNION ALL
SELECT id, 'Colman Domingo', 'Sing Sing' FROM categories WHERE name = 'Melhor Ator'
UNION ALL
SELECT id, 'Ralph Fiennes', 'Cônclave' FROM categories WHERE name = 'Melhor Ator'
UNION ALL
SELECT id, 'Sebastian Stan', 'O Aprendiz' FROM categories WHERE name = 'Melhor Ator';

-- Melhor Atriz Coadjuvante
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Monica Barbaro', 'Um Completo Desconhecido' FROM categories WHERE name = 'Melhor Atriz Coadjuvante'
UNION ALL
SELECT id, 'Ariana Grande', 'Wicked' FROM categories WHERE name = 'Melhor Atriz Coadjuvante'
UNION ALL
SELECT id, 'Felicity Jones', 'O Brutalista' FROM categories WHERE name = 'Melhor Atriz Coadjuvante'
UNION ALL
SELECT id, 'Isabella Rossellini', 'Cônclave' FROM categories WHERE name = 'Melhor Atriz Coadjuvante'
UNION ALL
SELECT id, 'Zoe Saldaña', 'Emília Pérez' FROM categories WHERE name = 'Melhor Atriz Coadjuvante';

-- Melhor Ator Coadjuvante
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Yura Borisov', 'Anora' FROM categories WHERE name = 'Melhor Ator Coadjuvante'
UNION ALL
SELECT id, 'Kieran Culkin', 'A Verdadeira Dor' FROM categories WHERE name = 'Melhor Ator Coadjuvante'
UNION ALL
SELECT id, 'Edward Norton', 'Um Completo Desconhecido' FROM categories WHERE name = 'Melhor Ator Coadjuvante'
UNION ALL
SELECT id, 'Guy Pearce', 'O Brutalista' FROM categories WHERE name = 'Melhor Ator Coadjuvante'
UNION ALL
SELECT id, 'Jeremy Strong', 'O Aprendiz' FROM categories WHERE name = 'Melhor Ator Coadjuvante';

-- Melhor Roteiro Original
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Anora', 'Anora' FROM categories WHERE name = 'Melhor Roteiro Original'
UNION ALL
SELECT id, 'O Brutalista', 'O Brutalista' FROM categories WHERE name = 'Melhor Roteiro Original'
UNION ALL
SELECT id, 'A Verdadeira Dor', 'A Verdadeira Dor' FROM categories WHERE name = 'Melhor Roteiro Original'
UNION ALL
SELECT id, 'September 5', 'September 5' FROM categories WHERE name = 'Melhor Roteiro Original'
UNION ALL
SELECT id, 'A Substância', 'A Substância' FROM categories WHERE name = 'Melhor Roteiro Original';

-- Melhor Roteiro Adaptado
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Um Completo Desconhecido', 'Um Completo Desconhecido' FROM categories WHERE name = 'Melhor Roteiro Adaptado'
UNION ALL
SELECT id, 'Cônclave', 'Cônclave' FROM categories WHERE name = 'Melhor Roteiro Adaptado'
UNION ALL
SELECT id, 'Emília Pérez', 'Emília Pérez' FROM categories WHERE name = 'Melhor Roteiro Adaptado'
UNION ALL
SELECT id, 'Nickel Boys', 'Nickel Boys' FROM categories WHERE name = 'Melhor Roteiro Adaptado'
UNION ALL
SELECT id, 'Sing Sing', 'Sing Sing' FROM categories WHERE name = 'Melhor Roteiro Adaptado';

-- Continue com as demais categorias...
-- (Para economizar espaço, mostrando apenas algumas categorias)
-- Você pode completar com os dados do oscar-quiz.tsx

-- Melhor Filme Internacional
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Eu Ainda Estou Aqui', 'Brasil' FROM categories WHERE name = 'Melhor Filme Internacional'
UNION ALL
SELECT id, 'A Garota da Agulha', 'Dinamarca' FROM categories WHERE name = 'Melhor Filme Internacional'
UNION ALL
SELECT id, 'Emília Pérez', 'França' FROM categories WHERE name = 'Melhor Filme Internacional'
UNION ALL
SELECT id, 'A Semente do Fruto Sagrado', 'Alemanha' FROM categories WHERE name = 'Melhor Filme Internacional'
UNION ALL
SELECT id, 'Flow', 'Letônia' FROM categories WHERE name = 'Melhor Filme Internacional';

-- Melhor Animação
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Flow', 'Flow' FROM categories WHERE name = 'Melhor Animação'
UNION ALL
SELECT id, 'Divertida Mente 2', 'Divertida Mente 2' FROM categories WHERE name = 'Melhor Animação'
UNION ALL
SELECT id, 'Memoir of a Snail', 'Memoir of a Snail' FROM categories WHERE name = 'Melhor Animação'
UNION ALL
SELECT id, 'Wallace & Gromit: Vengeance Most Fowl', 'Wallace & Gromit: Vengeance Most Fowl' FROM categories WHERE name = 'Melhor Animação'
UNION ALL
SELECT id, 'O Robô Selvagem', 'O Robô Selvagem' FROM categories WHERE name = 'Melhor Animação';

-- Melhor Documentário
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Black Box Diaries', 'Black Box Diaries' FROM categories WHERE name = 'Melhor Documentário'
UNION ALL
SELECT id, 'No Other Land', 'No Other Land' FROM categories WHERE name = 'Melhor Documentário'
UNION ALL
SELECT id, 'Porcelain War', 'Porcelain War' FROM categories WHERE name = 'Melhor Documentário'
UNION ALL
SELECT id, 'Soundtrack to a Coup d'Etat', 'Soundtrack to a Coup d'Etat' FROM categories WHERE name = 'Melhor Documentário'
UNION ALL
SELECT id, 'Sugarcane', 'Sugarcane' FROM categories WHERE name = 'Melhor Documentário';

-- Melhor Fotografia
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'O Brutalista', 'O Brutalista' FROM categories WHERE name = 'Melhor Fotografia'
UNION ALL
SELECT id, 'Duna: Parte Dois', 'Duna: Parte Dois' FROM categories WHERE name = 'Melhor Fotografia'
UNION ALL
SELECT id, 'Emília Pérez', 'Emília Pérez' FROM categories WHERE name = 'Melhor Fotografia'
UNION ALL
SELECT id, 'Maria Callas', 'Maria Callas' FROM categories WHERE name = 'Melhor Fotografia'
UNION ALL
SELECT id, 'Nosferatu', 'Nosferatu' FROM categories WHERE name = 'Melhor Fotografia';

-- Melhor Montagem
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Anora', 'Anora' FROM categories WHERE name = 'Melhor Montagem'
UNION ALL
SELECT id, 'O Brutalista', 'O Brutalista' FROM categories WHERE name = 'Melhor Montagem'
UNION ALL
SELECT id, 'Cônclave', 'Cônclave' FROM categories WHERE name = 'Melhor Montagem'
UNION ALL
SELECT id, 'Emília Pérez', 'Emília Pérez' FROM categories WHERE name = 'Melhor Montagem'
UNION ALL
SELECT id, 'Wicked', 'Wicked' FROM categories WHERE name = 'Melhor Montagem';

-- Melhor Desenho de Produção
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'O Brutalista', 'O Brutalista' FROM categories WHERE name = 'Melhor Desenho de Produção'
UNION ALL
SELECT id, 'Cônclave', 'Cônclave' FROM categories WHERE name = 'Melhor Desenho de Produção'
UNION ALL
SELECT id, 'Duna: Parte Dois', 'Duna: Parte Dois' FROM categories WHERE name = 'Melhor Desenho de Produção'
UNION ALL
SELECT id, 'Nosferatu', 'Nosferatu' FROM categories WHERE name = 'Melhor Desenho de Produção'
UNION ALL
SELECT id, 'Wicked', 'Wicked' FROM categories WHERE name = 'Melhor Desenho de Produção';

-- Melhor Figurino
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Um Completo Desconhecido', 'Um Completo Desconhecido' FROM categories WHERE name = 'Melhor Figurino'
UNION ALL
SELECT id, 'Cônclave', 'Cônclave' FROM categories WHERE name = 'Melhor Figurino'
UNION ALL
SELECT id, 'Gladiador II', 'Gladiador II' FROM categories WHERE name = 'Melhor Figurino'
UNION ALL
SELECT id, 'Nosferatu', 'Nosferatu' FROM categories WHERE name = 'Melhor Figurino'
UNION ALL
SELECT id, 'Wicked', 'Wicked' FROM categories WHERE name = 'Melhor Figurino';

-- Melhor Trilha Sonora
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'O Brutalista', 'O Brutalista' FROM categories WHERE name = 'Melhor Trilha Sonora'
UNION ALL
SELECT id, 'Cônclave', 'Cônclave' FROM categories WHERE name = 'Melhor Trilha Sonora'
UNION ALL
SELECT id, 'Emília Pérez', 'Emília Pérez' FROM categories WHERE name = 'Melhor Trilha Sonora'
UNION ALL
SELECT id, 'Wicked', 'Wicked' FROM categories WHERE name = 'Melhor Trilha Sonora'
UNION ALL
SELECT id, 'O Robô Selvagem', 'O Robô Selvagem' FROM categories WHERE name = 'Melhor Trilha Sonora';

-- Melhor Canção Original
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'El Mal', 'Emília Pérez' FROM categories WHERE name = 'Melhor Canção Original'
UNION ALL
SELECT id, 'The Journey', 'The Six Triple Eight' FROM categories WHERE name = 'Melhor Canção Original'
UNION ALL
SELECT id, 'Like a Bird', 'Sing Sing' FROM categories WHERE name = 'Melhor Canção Original'
UNION ALL
SELECT id, 'Mi Camino', 'Emília Pérez' FROM categories WHERE name = 'Melhor Canção Original'
UNION ALL
SELECT id, 'Never Too Late', 'Elton John: Never Too Late' FROM categories WHERE name = 'Melhor Canção Original';

-- Melhor Som
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Um Completo Desconhecido', 'Um Completo Desconhecido' FROM categories WHERE name = 'Melhor Som'
UNION ALL
SELECT id, 'Duna: Parte Dois', 'Duna: Parte Dois' FROM categories WHERE name = 'Melhor Som'
UNION ALL
SELECT id, 'Emília Pérez', 'Emília Pérez' FROM categories WHERE name = 'Melhor Som'
UNION ALL
SELECT id, 'Wicked', 'Wicked' FROM categories WHERE name = 'Melhor Som'
UNION ALL
SELECT id, 'O Robô Selvagem', 'O Robô Selvagem' FROM categories WHERE name = 'Melhor Som';

-- Melhores Efeitos Visuais
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Alien: Romulus', 'Alien: Romulus' FROM categories WHERE name = 'Melhores Efeitos Visuais'
UNION ALL
SELECT id, 'Better Man', 'Better Man' FROM categories WHERE name = 'Melhores Efeitos Visuais'
UNION ALL
SELECT id, 'Duna: Parte Dois', 'Duna: Parte Dois' FROM categories WHERE name = 'Melhores Efeitos Visuais'
UNION ALL
SELECT id, 'Wicked', 'Wicked' FROM categories WHERE name = 'Melhores Efeitos Visuais'
UNION ALL
SELECT id, 'O Reino do Planeta dos Macacos', 'O Reino do Planeta dos Macacos' FROM categories WHERE name = 'Melhores Efeitos Visuais';

-- Melhor Maquiagem e Cabelo
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Um Homem Diferente', 'Um Homem Diferente' FROM categories WHERE name = 'Melhor Maquiagem e Cabelo'
UNION ALL
SELECT id, 'Emília Pérez', 'Emília Pérez' FROM categories WHERE name = 'Melhor Maquiagem e Cabelo'
UNION ALL
SELECT id, 'Nosferatu', 'Nosferatu' FROM categories WHERE name = 'Melhor Maquiagem e Cabelo'
UNION ALL
SELECT id, 'A Substância', 'A Substância' FROM categories WHERE name = 'Melhor Maquiagem e Cabelo'
UNION ALL
SELECT id, 'Wicked', 'Wicked' FROM categories WHERE name = 'Melhor Maquiagem e Cabelo';

-- Melhor Curta-Metragem
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'A Lien', 'A Lien' FROM categories WHERE name = 'Melhor Curta-Metragem'
UNION ALL
SELECT id, 'Anuja', 'Anuja' FROM categories WHERE name = 'Melhor Curta-Metragem'
UNION ALL
SELECT id, 'I'm Not a Robot', 'I'm Not a Robot' FROM categories WHERE name = 'Melhor Curta-Metragem'
UNION ALL
SELECT id, 'The Last Ranger', 'The Last Ranger' FROM categories WHERE name = 'Melhor Curta-Metragem'
UNION ALL
SELECT id, 'The Man Who Could Not Remain Silent', 'The Man Who Could Not Remain Silent' FROM categories WHERE name = 'Melhor Curta-Metragem';

-- Melhor Curta de Animação
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Beautiful Men', 'Beautiful Men' FROM categories WHERE name = 'Melhor Curta de Animação'
UNION ALL
SELECT id, 'In the Shadow of the Cypress', 'In the Shadow of the Cypress' FROM categories WHERE name = 'Melhor Curta de Animação'
UNION ALL
SELECT id, 'Magic Candies', 'Magic Candies' FROM categories WHERE name = 'Melhor Curta de Animação'
UNION ALL
SELECT id, 'Wander to Wonder', 'Wander to Wonder' FROM categories WHERE name = 'Melhor Curta de Animação'
UNION ALL
SELECT id, 'Yuck!', 'Yuck!' FROM categories WHERE name = 'Melhor Curta de Animação';

-- Melhor Curta Documentário
INSERT INTO nominees (category_id, name, movie)
SELECT id, 'Death by Numbers', 'Death by Numbers' FROM categories WHERE name = 'Melhor Curta Documentário'
UNION ALL
SELECT id, 'I Am Ready, Warden', 'I Am Ready, Warden' FROM categories WHERE name = 'Melhor Curta Documentário'
UNION ALL
SELECT id, 'Incident', 'Incident' FROM categories WHERE name = 'Melhor Curta Documentário'
UNION ALL
SELECT id, 'Instruments of a Beating Heart', 'Instruments of a Beating Heart' FROM categories WHERE name = 'Melhor Curta Documentário'
UNION ALL
SELECT id, 'The Only Girl in the Orchestra', 'The Only Girl in the Orchestra' FROM categories WHERE name = 'Melhor Curta Documentário';

-- Seed completo com todas as 23 categorias e indicados do Oscar 2026
