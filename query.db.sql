-- Inserindo Clientes

INSERT INTO cliente (nome, telefone)
VALUES 
  ('João Silva', '21999990001'),
  ('Maria Oliveira', '21999990002'),
  ('Carlos Souza', '21999990003'),
  ('Ana Costa', '21999990004'),
  ('Pedro Santos', '21999990005'),
  ('Juliana Lima', '21999990006'),
  ('Marcos Pereira', '21999990007'),
  ('Fernanda Alves', '21999990008'),
  ('Ricardo Gomes', '21999990009'),
  ('Patrícia Rocha', '21999990010');

-- Inserindo Fornecedores

INSERT INTO fornecedor (nome)
VALUES 
  ('Fornecedor Alpha'),
  ('Fornecedor Beta'),
  ('Fornecedor Gama'),
  ('Fornecedor Delta'),
  ('Fornecedor Omega');

-- Inserindo Produtos

INSERT INTO produto (nome, descricao, categoria, ativo)
VALUES
  ('Produto 1', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 2', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 3', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 4', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 5', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 6', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 7', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 8', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 9', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 10', 'Lorem ipsum', 'Vestuário', TRUE),
  ('Produto 11', 'Lorem ipsum', 'Esportivo', TRUE),
  ('Produto 12', 'Lorem ipsum', 'Esportivo', TRUE),
  ('Produto 13', 'Lorem ipsum', 'Esportivo', TRUE),
  ('Produto 14', 'Lorem ipsum', 'Esportivo', TRUE),
  ('Produto 15', 'Lorem ipsum', 'Uniforme', TRUE),
  ('Produto 16', 'Lorem ipsum', 'Profissional', TRUE),
  ('Produto 17', 'Lorem ipsum', 'Profissional', TRUE),
  ('Produto 18', 'Lorem ipsum', 'Dormir', TRUE),
  ('Produto 19', 'Lorem ipsum', 'Dormir', TRUE),
  ('Produto 20', 'Lorem ipsum', 'Acessórios', TRUE);

-- Inserindo Materiais

INSERT INTO material (nome, unidade_base)
VALUES
  ('Material 1', 'UN'),
  ('Material 2', 'UN'),
  ('Material 3', 'UN'),
  ('Material 4', 'UN'),
  ('Material 5', 'UN'),
  ('Material 6', 'UN'),
  ('Material 7', 'M'),
  ('Material 8', 'M'),
  ('Material 9', 'M'),
  ('Material 10', 'M');

-- Inserindo Variações de Materiais

DO $$
DECLARE
  m RECORD;
  qtd_variacoes INT;
  i INT;
BEGIN
  FOR m IN SELECT id FROM material LOOP
    
    -- sorteia entre 4 e 10
    qtd_variacoes := (FLOOR(random() * 7 + 4))::INT;

    FOR i IN 1..qtd_variacoes LOOP
      INSERT INTO material_variacao (
        material_id,
        variacao,
        estoque
      ) VALUES (
        m.id,
        'Variação ' || i,
        ROUND((random() * 100)::numeric, 2)
      );
    END LOOP;

  END LOOP;
END $$;

-- Inserindo Variações de Produtos e Estoque

INSERT INTO variacao_produto (
  produto_id,
  sku,
  tamanho,
  cor,
  estoque,
  estoque_minimo,
  valor_base,
  ativo
)
SELECT
  p.id,
  'SKU-' || p.id || '-' || gs,
  (ARRAY['P', 'M', 'G', 'GG', 'EXG'])[floor(random() * 5)::int + 1],
  (ARRAY['Preto', 'Branco', 'Azul', 'Vermelho', 'Verde'])[floor(random() * 5)::int + 1],
  ROUND((random() * 100)::numeric, 2),
  ROUND((random() * 10)::numeric, 2),
  ROUND((random() * 200 + 50)::numeric, 2),
  TRUE
FROM produto p
CROSS JOIN LATERAL generate_series(
  1,
  (floor(random() * 5) + 6)::int
) gs;

-- Inserindo Produto-Material (3 a 7 materiais por variação)

INSERT INTO produto_material (
  variacao_produto_id,
  material_variacao_id,
  quantidade
)
SELECT
  vp.id,
  mv.id,
  ROUND((random() * 4.9 + 0.1)::numeric, 3)
FROM variacao_produto vp

CROSS JOIN LATERAL (
  SELECT id
  FROM material_variacao
  ORDER BY random()
  LIMIT (floor(random() * 5) + 3)::int  -- 3 a 7 materiais únicos
) mv;

INSERT INTO pedido (cliente_id, data, status, valor_total, prazo) VALUES
(1, CURRENT_TIMESTAMP, 'novo', 150.00, CURRENT_DATE + INTERVAL '1 day'),
(2, CURRENT_TIMESTAMP, 'novo', 180.00, CURRENT_DATE + INTERVAL '2 day'),
(3, CURRENT_TIMESTAMP, 'novo', 210.00, CURRENT_DATE + INTERVAL '3 day'),
(4, CURRENT_TIMESTAMP, 'novo', 240.00, CURRENT_DATE + INTERVAL '4 day'),
(5, CURRENT_TIMESTAMP, 'novo', 270.00, CURRENT_DATE + INTERVAL '5 day'),
(6, CURRENT_TIMESTAMP, 'novo', 300.00, CURRENT_DATE + INTERVAL '6 day'),
(7, CURRENT_TIMESTAMP, 'novo', 330.00, CURRENT_DATE + INTERVAL '7 day'),
(8, CURRENT_TIMESTAMP, 'novo', 360.00, CURRENT_DATE + INTERVAL '8 day'),
(9, CURRENT_TIMESTAMP, 'novo', 390.00, CURRENT_DATE + INTERVAL '9 day'),
(1, CURRENT_TIMESTAMP, 'novo', 420.00, CURRENT_DATE + INTERVAL '10 day'),
(2, CURRENT_TIMESTAMP, 'novo', 450.00, CURRENT_DATE + INTERVAL '11 day'),
(3, CURRENT_TIMESTAMP, 'novo', 480.00, CURRENT_DATE + INTERVAL '12 day'),
(4, CURRENT_TIMESTAMP, 'novo', 510.00, CURRENT_DATE + INTERVAL '13 day'),
(5, CURRENT_TIMESTAMP, 'novo', 540.00, CURRENT_DATE + INTERVAL '14 day'),
(6, CURRENT_TIMESTAMP, 'novo', 570.00, CURRENT_DATE + INTERVAL '15 day'),
(7, CURRENT_TIMESTAMP, 'novo', 600.00, CURRENT_DATE + INTERVAL '16 day'),
(8, CURRENT_TIMESTAMP, 'novo', 630.00, CURRENT_DATE + INTERVAL '17 day'),
(9, CURRENT_TIMESTAMP, 'novo', 660.00, CURRENT_DATE + INTERVAL '18 day'),
(1, CURRENT_TIMESTAMP, 'novo', 690.00, CURRENT_DATE + INTERVAL '19 day'),
(2, CURRENT_TIMESTAMP, 'novo', 720.00, CURRENT_DATE + INTERVAL '20 day'),

(3, CURRENT_TIMESTAMP, 'em_producao', 150.00, CURRENT_DATE + INTERVAL '1 day'),
(4, CURRENT_TIMESTAMP, 'em_producao', 180.00, CURRENT_DATE + INTERVAL '2 day'),
(5, CURRENT_TIMESTAMP, 'em_producao', 210.00, CURRENT_DATE + INTERVAL '3 day'),
(6, CURRENT_TIMESTAMP, 'em_producao', 240.00, CURRENT_DATE + INTERVAL '4 day'),
(7, CURRENT_TIMESTAMP, 'em_producao', 270.00, CURRENT_DATE + INTERVAL '5 day'),
(8, CURRENT_TIMESTAMP, 'em_producao', 300.00, CURRENT_DATE + INTERVAL '6 day'),
(9, CURRENT_TIMESTAMP, 'em_producao', 330.00, CURRENT_DATE + INTERVAL '7 day'),
(1, CURRENT_TIMESTAMP, 'em_producao', 360.00, CURRENT_DATE + INTERVAL '8 day'),
(2, CURRENT_TIMESTAMP, 'em_producao', 390.00, CURRENT_DATE + INTERVAL '9 day'),
(3, CURRENT_TIMESTAMP, 'em_producao', 420.00, CURRENT_DATE + INTERVAL '10 day'),
(4, CURRENT_TIMESTAMP, 'em_producao', 450.00, CURRENT_DATE + INTERVAL '11 day'),
(5, CURRENT_TIMESTAMP, 'em_producao', 480.00, CURRENT_DATE + INTERVAL '12 day'),
(6, CURRENT_TIMESTAMP, 'em_producao', 510.00, CURRENT_DATE + INTERVAL '13 day'),
(7, CURRENT_TIMESTAMP, 'em_producao', 540.00, CURRENT_DATE + INTERVAL '14 day'),
(8, CURRENT_TIMESTAMP, 'em_producao', 570.00, CURRENT_DATE + INTERVAL '15 day'),
(9, CURRENT_TIMESTAMP, 'em_producao', 600.00, CURRENT_DATE + INTERVAL '16 day'),
(1, CURRENT_TIMESTAMP, 'em_producao', 630.00, CURRENT_DATE + INTERVAL '17 day'),
(2, CURRENT_TIMESTAMP, 'em_producao', 660.00, CURRENT_DATE + INTERVAL '18 day'),
(3, CURRENT_TIMESTAMP, 'em_producao', 690.00, CURRENT_DATE + INTERVAL '19 day'),
(4, CURRENT_TIMESTAMP, 'em_producao', 720.00, CURRENT_DATE + INTERVAL '20 day'),

(5, CURRENT_TIMESTAMP, 'confirmado', 150.00, CURRENT_DATE + INTERVAL '1 day'),
(6, CURRENT_TIMESTAMP, 'confirmado', 180.00, CURRENT_DATE + INTERVAL '2 day'),
(7, CURRENT_TIMESTAMP, 'confirmado', 210.00, CURRENT_DATE + INTERVAL '3 day'),
(8, CURRENT_TIMESTAMP, 'confirmado', 240.00, CURRENT_DATE + INTERVAL '4 day'),
(9, CURRENT_TIMESTAMP, 'confirmado', 270.00, CURRENT_DATE + INTERVAL '5 day'),
(1, CURRENT_TIMESTAMP, 'confirmado', 300.00, CURRENT_DATE + INTERVAL '6 day'),
(2, CURRENT_TIMESTAMP, 'confirmado', 330.00, CURRENT_DATE + INTERVAL '7 day'),
(3, CURRENT_TIMESTAMP, 'confirmado', 360.00, CURRENT_DATE + INTERVAL '8 day'),
(4, CURRENT_TIMESTAMP, 'confirmado', 390.00, CURRENT_DATE + INTERVAL '9 day'),
(5, CURRENT_TIMESTAMP, 'confirmado', 420.00, CURRENT_DATE + INTERVAL '10 day'),
(6, CURRENT_TIMESTAMP, 'confirmado', 450.00, CURRENT_DATE + INTERVAL '11 day'),
(7, CURRENT_TIMESTAMP, 'confirmado', 480.00, CURRENT_DATE + INTERVAL '12 day'),
(8, CURRENT_TIMESTAMP, 'confirmado', 510.00, CURRENT_DATE + INTERVAL '13 day'),
(9, CURRENT_TIMESTAMP, 'confirmado', 540.00, CURRENT_DATE + INTERVAL '14 day'),
(1, CURRENT_TIMESTAMP, 'confirmado', 570.00, CURRENT_DATE + INTERVAL '15 day'),
(2, CURRENT_TIMESTAMP, 'confirmado', 600.00, CURRENT_DATE + INTERVAL '16 day'),
(3, CURRENT_TIMESTAMP, 'confirmado', 630.00, CURRENT_DATE + INTERVAL '17 day'),
(4, CURRENT_TIMESTAMP, 'confirmado', 660.00, CURRENT_DATE + INTERVAL '18 day'),
(5, CURRENT_TIMESTAMP, 'confirmado', 690.00, CURRENT_DATE + INTERVAL '19 day'),
(6, CURRENT_TIMESTAMP, 'confirmado', 720.00, CURRENT_DATE + INTERVAL '20 day');

-- Inserindo Item Pedido (2 a 10 itens por pedido, todos pendentes)
WITH selected_orders AS (
  SELECT id
  FROM pedido
  ORDER BY id DESC
  LIMIT 90
)
INSERT INTO item_pedido (
  pedido_id,
  variacao_produto_id,
  quantidade,
  preco_unitario,
  quantidade_atendida,
  status
)
SELECT
  o.id,
  vp.id,
  (floor(random() * 10) + 1)::int AS quantidade,
  vp.valor_base,
  0 AS quantidade_atendida,
  'pendente' AS status
FROM selected_orders o
JOIN LATERAL (
  SELECT id, valor_base
  FROM variacao_produto
  ORDER BY random()
  LIMIT (floor(random() * 9) + 2)::int
) vp ON true;

-- Inserir 6 processos aleatórios
INSERT INTO processo (nome) VALUES
('Corte'),
('Colarete'),
('Overloque'),
('travete'),
('Limpeza'),
('Embalagem');

-- Para cada produto, inserir entre 3 e 6 processos
-- Sempre contendo processo_id = 1 e processo_id = 6

DO $$
DECLARE
    p RECORD;
    qtd_processos INT;
    processos_escolhidos INT[];
    proc_id INT;
    ordem_atual INT;
BEGIN
    FOR p IN SELECT id FROM produto LOOP
        
        -- Quantidade aleatória entre 3 e 6
        qtd_processos := floor(random() * 4 + 3);

        -- Sempre começa com 1 e 6
        processos_escolhidos := ARRAY[1,6];

        -- Completa com ids aleatórios entre 2 e 5 sem repetir
        WHILE array_length(processos_escolhidos,1) < qtd_processos LOOP
            proc_id := floor(random() * 4 + 2); -- gera 2 até 5

            IF NOT proc_id = ANY(processos_escolhidos) THEN
                processos_escolhidos := array_append(processos_escolhidos, proc_id);
            END IF;
        END LOOP;

        -- Ordena aleatoriamente, mas garante 1 primeiro e 6 último
        processos_escolhidos := (
            SELECT ARRAY[1] ||
                   ARRAY(
                       SELECT x
                       FROM unnest(processos_escolhidos) x
                       WHERE x NOT IN (1,6)
                       ORDER BY random()
                   ) ||
                   ARRAY[6]
        );

        -- Inserir na tabela produto_processo
        ordem_atual := 1;

        FOREACH proc_id IN ARRAY processos_escolhidos LOOP
            INSERT INTO produto_processo (
                produto_id,
                processo_id,
                ordem,
                tempo_estimado
            )
            VALUES (
                p.id,
                proc_id,
                ordem_atual,
                round((random() * 40 + 10)::numeric, 2) -- entre 10 e 50
            );

            ordem_atual := ordem_atual + 1;
        END LOOP;

    END LOOP;
END $$;


INSERT INTO costureiro (nome, ativo) VALUES
('Costureiro 1', false),
('Costureiro 2' , false),
('Costureiro 3', false),
('Costureiro 4', false),
('Costureiro 5', false);