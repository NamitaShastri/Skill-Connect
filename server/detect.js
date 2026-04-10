import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const passwords = ['postgres', 'root', '1234', '12345', 'password', 'admin', 'ishan', 'Ishan', '', '123'];

async function tryPwd(pwd) {
  const pool = new Pool({ user: 'postgres', password: pwd, host: 'localhost', database: 'postgres', port: 5432 });
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    return false;
  } finally {
    await pool.end();
  }
}

async function run() {
  for (let p of passwords) {
    if (await tryPwd(p)) {
      fs.appendFileSync('.env', '\nDB_PASSWORD=' + p + '\n');
      fs.writeFileSync('pwd_found.txt', p);
      process.exit(0);
    }
  }
  fs.writeFileSync('pwd_found.txt', 'FAILED');
}

run();
