import asyncio
import asyncpg
import os


def _get_db_conection_args():
    return {
        'database': os.environ['POSTGRES_DB'],
        'user': os.environ['POSTGRES_USER'],
        'password': os.environ['POSTGRES_PASSWORD'],
        'port': os.environ['POSTGRES_PORT'],
        'host': os.environ['POSTGRES_HOST']
    }


def render_hillshade(lon1, lat1, lon2, lat2):


    async def run():
        conn = await asyncpg.connect(**_get_db_conection_args())
        values = await conn.fetch('''
            SELECT ST_Clip(ST_Union(rast), ST_Transform(ST_MakeEnvelope(?, ?, ?, ?,4326),3035) 
            FROM hillshade
            WHERE
                ST_Intersects(rast, ST_Transform(ST_MakeEnvelope(?, ?, ?, ?,4326),3035) )
        ''')
        await conn.close()
        return values

    loop = asyncio.get_event_loop()
    return loop.run_until_complete(run())

    '''
    SELECT
    ST_AsPNG(ST_Transform(
        ST_AddBand(ST_Union(rast, 1), ARRAY[ST_Union(rast, 2), ST_Union(rast, 3)])
        ,$input_srid) ) As
    new_rast
    FROM aerials.boston
	WHERE
	 ST_Intersects(rast, ST_Transform(ST_MakeEnvelope(-71.1217, 42.227, -71.1210, 42.218,4326),26986) )
    '''
    pass

def render_mapnik():
    pass

def mix():
    pass
