


UPDATE stream s
SET grade = floor(LEAST(35::double precision, GREATEST(5::double precision, log(s.length) * 7::double precision - 17::double precision)))::integer;

CREATE INDEX IF NOT EXISTS idx__stream__grade ON stream(grade);

DROP MATERIALIZED VIEW IF EXISTS text_waterway;
CREATE MATERIALIZED VIEW text_waterway AS
SELECT st_collect(l.way) AS way,s.grade,l.name, 0
   FROM osm_waterway l
     JOIN stream s ON s.osm_id = l.osm_id
  WHERE l.waterway IS NOT NULL AND l.osm_id > 0 AND (l.name IS NOT NULL AND l.name != '') AND 1 = 1 AND l.way IS NOT NULL
  GROUP BY s.spring_id, s.grade, l.name;


CREATE INDEX idx__text_waterway__way ON text_waterway USING GIST(way);