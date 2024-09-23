import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATION_COUNT = 100000;

async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const keyMaterial = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return Crypto.pbkdf2Async(
    Crypto.CryptoDigestAlgorithm.SHA256,
    keyMaterial,
    salt,
    ITERATION_COUNT,
    KEY_LENGTH
  );
}

export async function encrypt(fileUri, password) {
  const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
  const contentBuffer = Crypto.getRandomValues(new Uint8Array(Buffer.from(fileContent, 'base64')));
  const iv = Crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const salt = Crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const key = await deriveKey(password, salt);

  const encrypted = await Crypto.digestStringAsync(
    ALGORITHM,
    contentBuffer,
    {
      key,
      iv,
      additionalData: new Uint8Array(0),
    }
  );

  const result = new Uint8Array(SALT_LENGTH + IV_LENGTH + encrypted.length);
  result.set(salt, 0);
  result.set(iv, SALT_LENGTH);
  result.set(new Uint8Array(Buffer.from(encrypted, 'base64')), SALT_LENGTH + IV_LENGTH);

  return Buffer.from(result).toString('base64');
}

export async function decrypt(encryptedData, password) {
  const dataBuffer = new Uint8Array(Buffer.from(encryptedData, 'base64'));
  
  const salt = dataBuffer.slice(0, SALT_LENGTH);
  const iv = dataBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encryptedContent = dataBuffer.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);

  try {
    const decrypted = await Crypto.digestStringAsync(
      ALGORITHM,
      encryptedContent,
      {
        key,
        iv,
        additionalData: new Uint8Array(0),
        decrypt: true
      }
    );

    return Buffer.from(decrypted, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed. The password may be incorrect.');
  }
}