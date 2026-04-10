import { exec } from 'child_process';
import fs from 'fs';

exec('node server.js', (err, stdout, stderr) => {
  fs.writeFileSync('utf8_log.txt', 'Err: ' + err + '\nStdout: ' + stdout + '\nStderr: ' + stderr);
});
