import pool from './db.js';

async function run() {
  try {
    await pool.query(
      "INSERT INTO users (name, year, department, title, email, password, role) VALUES ('Rohan Tester', 3, 'CS', 'Student Tester', 'rohan123@skillconnect.edu', '1234', 'student') ON CONFLICT (email) DO NOTHING;"
    );
    await pool.query(
      "INSERT INTO users (name, department, title, email, password, role) VALUES ('Dr. Sharma Tester', 'CS', 'Faculty Tester', 'sharma123@skillconnect.edu', '1234', 'faculty') ON CONFLICT (email) DO NOTHING;"
    );
    console.log('Inserted test users successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to insert test users', err);
    process.exit(1);
  }
}

run();
