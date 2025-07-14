import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // The cost factor. Higher is more secure but slower. 10-12 is generally good.

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
}

export async function verifyPassword(password: string, hashedPasswordFromDb: string): Promise<boolean> {
  const isValid = await bcrypt.compare(password, hashedPasswordFromDb);
  return isValid;
}