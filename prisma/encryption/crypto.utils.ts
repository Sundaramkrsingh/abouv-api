// src/utils/encryption.util.ts
import { tr } from '@faker-js/faker';
import * as crypto from 'crypto';

// console.log(crypto.randomBytes(32).toString('hex'));

// Load the encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY is not set in environment variables');
}

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(text: string): string {
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error decrypting text:', error);
    throw error;
  }
}

export function encryptJson(data: any): string {
  return encrypt(JSON.stringify(data));
}

export function decryptJson(encryptedData: string): any {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
}

export function decryptOptionsText(
  encryptedData: Record<string, any>,
): Array<any> {
  return Object.entries(encryptedData).map(([key, value]) => ({
    id: key,
    ...value,
    text: decrypt(value.text),
  }));
}

export function encryptOptionsText(
  decryptedData: Record<string, any>,
): Array<any> {
  return Object.entries(decryptedData).map(([key, value]) => ({
    id: key,
    ...value,
    text: encrypt(value.text),
  }));
}
