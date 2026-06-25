export async function encryptFile(
  file: File,
  publicKey: string
): Promise<{ encryptedBlob: Blob; iv: string; salt: string }> {
  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');

  // Derive key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(publicKey + saltHex),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join('');

  // Read file
  const fileBuffer = await file.arrayBuffer();

  // Encrypt
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );

  const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });

  return { encryptedBlob, iv: ivHex, salt: saltHex };
}

export async function decryptFile(
  encryptedBlob: Blob,
  publicKey: string,
  ivHex: string,
  saltHex: string
): Promise<Blob> {
  // Reconstruct salt and IV
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

  // Derive key (same as encryption)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(publicKey + saltHex),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Read encrypted blob
  const encryptedBuffer = await encryptedBlob.arrayBuffer();

  // Decrypt
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBuffer
  );

  return new Blob([decryptedData], { type: 'application/octet-stream' });
}
