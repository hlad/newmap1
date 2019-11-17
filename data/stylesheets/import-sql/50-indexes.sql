


ALTER TABLE contour RENAME TO contour_raw;
CREATE TABLE contour AS
SELECT
    ele,
    (CASE
      WHEN ele::integer % 500 = 0 THEN 500
      WHEN ele::integer % 200 = 0 THEN 200
      WHEN ele::integer % 100 = 0 THEN 100
      WHEN ele::integer %  50 = 0 THEN  50
      WHEN ele::integer %  20 = 0 THEN  20
      WHEN ele::integer %  10 = 0 THEN  10
      WHEN ele::integer %   5 = 0 THEN   5
      ELSE 5
    END) AS modulo,
    ST_Subdivide(ST_Transform(wkb_geometry,3857)) AS wkb_geometry
FROM contour_raw

CREATE INDEX IF NOT EXISTS contour__modulo__idx ON contour(modulo);
CREATE INDEX IF NOT EXISTS contour__ele_idx on contour(ele);
CREATE INDEX IF NOT EXISTS contour__geom_idx on contour using gist(wkb_geometry);


DROP VIEW IF EXISTS highway_access_centroids;
CREATE VIEW highway_access_centroids AS
SELECT H1.osm_id,St_Centroid(ST_Envelope(H1.way)) AS centroid FROM highways H1
WHERE COALESCE(H1.access,H1.bicycle,H1.horse,H1.inline_skates,H1.motorcar,H1.motorcycle,H1.motor_vehicle,H1.foot,H1.ski,H1.bus) IS NOT NULL;

--CREATE INDEX i__highway_access_centroids__centroid ON highway_access_centroids USING GIST ( centroid );

--DROP TABLE IF EXISTS highway_access_density;
--CREATE TABLE highway_access_density AS
--SELECT H1.osm_id AS osm_id,Count(H2.osm_id) AS density FROM highway_access_centroids H1
--JOIN highway_access_centroids H2 ON ST_DWithin(H1.centroid,H2.centroid,1000)  AND H1.osm_id <> H2.osm_id
--GROUP BY H1.osm_id;

CREATE INDEX IF NOT EXISTS idx__osm_landcover__way_area ON osm_landcover(way_area);
CREATE INDEX IF NOT EXISTS idx__osm_landcover__building ON osm_landcover(building);

CREATE INDEX IF NOT EXISTS idx__osm_highway__layer ON osm_highway(layer);
CREATE INDEX IF NOT EXISTS idx__osm_railway__layer ON osm_railway(layer);

CREATE INDEX IF NOT EXISTS idx__osm_building__way_area ON osm_building(way_area);

CREATE INDEX IF NOT EXISTS idx__osm_building__name ON osm_building(name);
CREATE INDEX IF NOT EXISTS idx__osm_building__building ON osm_building(building);

CREATE INDEX IF NOT EXISTS idx__osm_waterway__name ON osm_waterway(name);
CREATE INDEX IF NOT EXISTS idx__osm_waterway__waterway ON osm_waterway(waterway);
CREATE INDEX IF NOT EXISTS idx__stream__osm_id ON stream(osm_id);
CREATE INDEX IF NOT EXISTS idx__stream__length ON stream(length);
CREATE INDEX IF NOT EXISTS idx__stream__spring_id ON stream(spring_id);

CREATE INDEX idx__osm_route__member_id ON osm_route(member_id);
CREATE INDEX idx__osm_route__member_id_osm_id ON osm_route(member_id, osm_id);

--CREATE INDEX IF NOT EXISTS idx__symbol_density__osm_id ON symbol_density(osm_id);
--CREATE INDEX IF NOT EXISTS idx__symbol_density__count ON symbol_density(count);



