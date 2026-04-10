import fs from 'fs';
fetch('http://localhost:3000/api/events')
  .then(res => res.json())
  .then(data => fs.writeFileSync('event_result.json', JSON.stringify(data[0], null, 2)))
  .catch(err => fs.writeFileSync('event_result.json', 'Error: ' + err.message));
