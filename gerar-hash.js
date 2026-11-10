import bcrypt from 'bcrypt';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const terminal = createInterface({ input, output });
const senha = process.argv[2] || await terminal.question('Digite a senha para gerar o hash: ');
terminal.close();

if (!senha) {
  console.error('Informe uma senha para gerar o hash.');
  process.exitCode = 1;
} else {
  console.log(await bcrypt.hash(senha, 10));
}
