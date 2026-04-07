async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "rohan@gmail.com", password: "1234", role: "student" })
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
  } catch(err) {
    console.error("Fetch failed:", err);
  }
}
test();
