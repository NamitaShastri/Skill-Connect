import db from './db.js';
import fs from 'fs';

async function run() {
  try {
    const res = await db.query('SELECT COUNT(*) FROM users');
    fs.writeFileSync('pg_test_out.txt', 'DB SUCCESS! Users count: ' + res.rows[0].count, 'utf8');
  } catch (err) {
    fs.writeFileSync('pg_test_out.txt', 'DB ERROR: ' + err.message, 'utf8');
  }
  process.exit(0);
}
run();
