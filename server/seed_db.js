import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function seed() {
  const sqlPath = path.join(__dirname, '../Skill_Connect DB.sql');
  const sqlFile = fs.readFileSync(sqlPath, 'utf8');
  
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    port: parseInt(process.env.DB_PORT || '5432')
  });

  try {
    await client.connect();
    await client.query(sqlFile);
    fs.writeFileSync('seed_errors.json', JSON.stringify({ success: true }));
  } catch (err) {
    fs.writeFileSync('seed_errors.json', JSON.stringify({ success: false, error: err.message }));
  } finally {
    await client.end();
  }
}

seed();
