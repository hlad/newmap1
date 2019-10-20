DROP TABLE IF EXISTS osm_symbol CASCADE;
CREATE TABLE osm_symbol AS
SELECT
    osm_id,name,int_name,"name:en","name:de","name:cs",historic,leisure,man_made,shop,sport,
    tourism,amenity,ruins,castle_type,building,"natural",military,"tower:type",information,
    place_of_worship,"place_of_worship:type",
    highway,railway,aeroway,power,wikipedia,website,colour,cuisine,parking,maxheight,
    fee,surveillance,memorial,operator,cargo,transport,public_transport,
    z_order,way
FROM osm_symbol_point
UNION
SELECT
    osm_id,name,int_name,"name:en","name:de","name:cs",historic,leisure,man_made,shop,sport,
    tourism,amenity,ruins,castle_type,building,"natural",military,"tower:type",information,
    place_of_worship,"place_of_worship:type",
    highway,railway,aeroway,power,wikipedia,website,colour,cuisine,parking,maxheight,
    fee,surveillance,memorial,operator,cargo,transport,public_transport,
    z_order,ST_Centroid(way) AS way
FROM osm_symbol_polygon;

UPDATE osm_symbol SET castle_type = 'no' WHERE castle_type = '';
UPDATE osm_symbol SET ruins = 'no' WHERE ruins = '';
UPDATE osm_symbol SET historic = 'no' WHERE historic = '';
UPDATE osm_symbol SET building = 'no' WHERE building = '';

CREATE INDEX osm_symbol__osm_id_idx ON osm_symbol(osm_id);
CREATE INDEX osm_symbol__historic__idx ON osm_symbol(historic);
CREATE INDEX osm_symbol__amenity__idx ON osm_symbol(amenity);
CREATE INDEX osm_symbol__leisure__idx ON osm_symbol(leisure);
CREATE INDEX osm_symbol__sport__idx ON osm_symbol(sport);
CREATE INDEX osm_symbol__man_made__idx ON osm_symbol(man_made);
CREATE INDEX osm_symbol__military__idx ON osm_symbol(military);
CREATE INDEX osm_symbol__railway__idx ON osm_symbol(railway);
CREATE INDEX osm_symbol__aeroway__idx ON osm_symbol(aeroway);
CREATE INDEX osm_symbol__highway__idx ON osm_symbol(highway);
CREATE INDEX osm_symbol__tourism__idx ON osm_symbol(tourism);
CREATE INDEX osm_symbol__building__idx ON osm_symbol(building);


CREATE INDEX osm_symbol__way__idx ON osm_symbol USING GIST (way);

