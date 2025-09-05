import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { storage } from '../server/storage.js';

function getArg(name: string, def?: string) {
  const idx = process.argv.findIndex(a => a === `--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return def;
}

async function main() {
  const email = getArg('email', 'teste@zaplog.com')!;
  const password = getArg('password', '123456')!;
  const name = getArg('name', 'Teste Local')!;

  let user = await storage.getUserByEmail(email);
  if (!user) {
    const hashed = bcrypt.hashSync(password, 10);
    user = await storage.createUser({ email, password: hashed, name, plan: 'free' } as any);
    console.log('Created user:', { id: (user as any).id, email: (user as any).email });
  } else {
    console.log('User already exists:', { id: (user as any).id, email: (user as any).email });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

