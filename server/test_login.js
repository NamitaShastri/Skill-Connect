async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cy1@gmail.com', password: '1234', role: 'student' })
    });
    const data = await res.json();
    console.log(data);
    process.exit(data.success ? 0 : 1);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();
