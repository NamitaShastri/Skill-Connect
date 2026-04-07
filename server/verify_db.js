import fs from 'fs';
import db from './db.js';

async function verify() {
   try {
      const resCount = await db.query('SELECT count(*) as total FROM users');
      fs.writeFileSync('db_status.json', JSON.stringify({ success: true, count: resCount.rows[0].total }));
   } catch(e) {
      fs.writeFileSync('db_status.json', JSON.stringify({ success: false, error: e.message, code: e.code }));
   }
   process.exit(0);
}
verify();
