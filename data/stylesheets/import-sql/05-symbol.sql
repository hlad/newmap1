DROP TABLE IF EXISTS osm_symbol;
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
FROM osm_symbol_polygon



