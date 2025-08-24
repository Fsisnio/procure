import { Pool } from 'pg';

// Database connection configuration
const getDatabaseConfig = () => {
  // Use environment variable if available, otherwise fallback to hardcoded string
  const connectionString = process.env.REACT_APP_DATABASE_URL || 
    'postgresql://procure_poco_user:4wKCy8V89mbWFlJGy9Eke20iFMNbQWV1@dpg-d2lh2truibrs73f86cs0-a.oregon-postgres.render.com/procure_poco';
  
  return {
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
  };
};

const pool = new Pool(getDatabaseConfig());

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
