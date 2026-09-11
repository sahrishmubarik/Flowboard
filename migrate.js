import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

// ✨ Clean ES Module import for dotenv config
import 'dotenv/config'; 

// Next.js uses .env.local by default, so we specify it manually via process.env
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


async function run() {
  console.log('Connecting to remote database...');
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });


  await client.connect();
  const db = drizzle(client);

  console.log('Applying migrations... ');
  
  // This reads your generated .sql files and pushes them to your cloud DB
  await migrate(db, { migrationsFolder: './src/db/migrations' });

  console.log('Done! Migrations completed successfully. ');
  await client.end(); // This stops the terminal from hanging!
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
