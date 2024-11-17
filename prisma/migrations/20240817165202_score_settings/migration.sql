CREATE OR REPLACE VIEW pwa."ScoresView" AS
SELECT
    t.id AS "tier1Id",
    t.name AS "tier1Name",
    s.level AS "stageLevel",
    CASE
        WHEN t.id = 1 THEN 
            CASE
                WHEN s.level = 'S01' THEN 200
                WHEN s.level LIKE 'S1%' THEN 400 
                WHEN s.level LIKE 'S2%' THEN 800
                WHEN s.level LIKE 'S3%' THEN 1600 
                WHEN s.level LIKE 'S4%' THEN 3200
                WHEN s.level LIKE 'S5%' THEN 6400 
                WHEN s.level LIKE 'S6%' THEN 12800
            END
        WHEN t.id = 2 THEN 
            CASE
                WHEN s.level = 'S01' THEN 200
                WHEN s.level LIKE 'S1%' THEN 400 
                WHEN s.level LIKE 'S2%' THEN 800
                WHEN s.level LIKE 'S3%' THEN 1600
                WHEN s.level LIKE 'S4%' THEN 3200
                WHEN s.level LIKE 'S5%' THEN 6400
                WHEN s.level LIKE 'S6%' THEN 12800
            END
        WHEN t.id = 3 THEN 
            CASE
                WHEN s.level = 'S01' THEN 200
                WHEN s.level LIKE 'S1%' THEN 400
                WHEN s.level LIKE 'S2%' THEN 800
                WHEN s.level LIKE 'S3%' THEN 1600
                WHEN s.level LIKE 'S4%' THEN 3200
                WHEN s.level LIKE 'S5%' THEN 6400
                WHEN s.level LIKE 'S6%' THEN 12800
            END
        WHEN t.id = 4 THEN 
            CASE
                WHEN s.level = 'S01' THEN 100
                WHEN s.level LIKE 'S1%' THEN 200
                WHEN s.level LIKE 'S2%' THEN 400
                WHEN s.level LIKE 'S3%' THEN 800
                WHEN s.level LIKE 'S4%' THEN 1600
                WHEN s.level LIKE 'S5%' THEN 3200
                WHEN s.level LIKE 'S6%' THEN 6400
            END
        WHEN t.id = 5 THEN NULL
        WHEN t.id = 6 THEN 
            CASE
                WHEN s.level = 'S01' THEN 300
                WHEN s.level LIKE 'S1%' THEN 600
                WHEN s.level LIKE 'S2%' THEN 1200
                WHEN s.level LIKE 'S3%' THEN 2400
                WHEN s.level LIKE 'S4%' THEN 4800
                WHEN s.level LIKE 'S5%' THEN 9600
                WHEN s.level LIKE 'S6%' THEN 19200
            END
        ELSE NULL
    END AS "score"
FROM
    "pwa"."StageSetting" s
CROSS JOIN
    "pwa"."Tier1" t;
