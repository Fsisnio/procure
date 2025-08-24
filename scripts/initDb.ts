import { initializeDatabase, closeDatabase } from '../src/config/initDatabase';

async function main() {
  try {
    console.log('Starting database initialization...');
    await initializeDatabase();
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

main();
