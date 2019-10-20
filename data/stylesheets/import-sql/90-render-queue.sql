
CREATE TABLE IF NOT EXISTS render_queue(id SERIAL, zoom INT NOT NULL, minx INT NOT NULL, miny INT NOT NULL, maxx INT NOT NULL, maxy INT NOT NULL, add_time TIMESTAMP NOT NULL DEFAULT NOW(), work_time TIMESTAMP, done_time TIMESTAMP, failed_time TIMESTAMP, attemts INT NOT NULL DEFAULT 0);

CREATE INDEX IF NOT EXISTS idx__render_queue__add_time ON render_queue(add_time);
CREATE INDEX IF NOT EXISTS idx__render_queue__failed_time ON render_queue(failed_time);
CREATE INDEX IF NOT EXISTS idx__render_queue__done_time ON render_queue(done_time);
CREATE INDEX IF NOT EXISTS idx__render_queue__work_time ON render_queue(work_time);
