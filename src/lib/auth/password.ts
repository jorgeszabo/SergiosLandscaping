/* Password hashing via bcryptjs — a standard, well-tested library. Plaintext
   passwords are never stored (Code handoff §6); we hash on seed and compare on
   login. No hand-rolled crypto. */
import bcrypt from "bcryptjs";

const ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(plain, hash);
}
