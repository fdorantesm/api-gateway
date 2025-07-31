import fs from 'fs';
import path from 'path';
import { ensureLogsDir } from './config';

export function logToFile(node: string, message: string) {
  const dir = ensureLogsDir();
  const file = path.join(dir, `${node}.log`);
  fs.appendFileSync(file, message + '\n');
}

export function tailLog(node: string) {
  const file = path.join(ensureLogsDir(), `${node}.log`);
  if (!fs.existsSync(file)) {
    console.error('Log file not found for', node);
    process.exit(1);
  }
  let size = fs.statSync(file).size;
  const stream = fs.createReadStream(file, { encoding: 'utf-8', start: 0 });
  stream.on('data', chunk => process.stdout.write(chunk));
  fs.watchFile(file, { interval: 1000 }, () => {
    const newSize = fs.statSync(file).size;
    if (newSize > size) {
      const fd = fs.openSync(file, 'r');
      const buffer = Buffer.alloc(newSize - size);
      fs.readSync(fd, buffer, 0, buffer.length, size);
      fs.closeSync(fd);
      process.stdout.write(buffer.toString());
      size = newSize;
    }
  });
}
