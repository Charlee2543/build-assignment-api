// Create PostgreSQL Connection Pool here !
import * as pg from 'pg';
const { Pool } = pg.default;

const connectionPool = new Pool({
   connectionString:
      'postgresql://postgres:56789@localhost:5432/Assingment_Creating_dataAPI',
});

export default connectionPool;
