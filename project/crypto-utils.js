/**
 * crypto-utils.js
 * AES-GCM encryption/decryption using the browser's native Web Crypto API.
 * Reporter identity is encrypted before storage; only admin key can decrypt.
 */

const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Derives a CryptoKey from a passphrase string using PBKDF2.
 * @param {string} passphrase
 * @param {Uint8Array} salt
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(passphrase, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 200000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: ALGO, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts a plaintext string with AES-GCM.
 * @param {string} plaintext
 * @param {string} passphrase
 * @returns {Promise<string>} base64-encoded payload: salt|iv|ciphertext
 */
async function encryptData(plaintext, passphrase) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);

    const cipherBuffer = await crypto.subtle.encrypt(
        { name: ALGO, iv },
        key,
        enc.encode(plaintext)
    );

    // Combine salt + iv + ciphertext into one buffer
    const combined = new Uint8Array(salt.length + iv.length + cipherBuffer.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(cipherBuffer), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts an AES-GCM encrypted base64 payload.
 * @param {string} b64payload
 * @param {string} passphrase
 * @returns {Promise<string>} decrypted plaintext
 */
async function decryptData(b64payload, passphrase) {
    const combined = Uint8Array.from(atob(b64payload), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const key = await deriveKey(passphrase, salt);

    const plainBuffer = await crypto.subtle.decrypt(
        { name: ALGO, iv },
        key,
        ciphertext
    );

    return new TextDecoder().decode(plainBuffer);
}

/**
 * Generates a pseudo-anonymous session token for the reporter.
 * This is what gets encrypted — NOT any real personal identifier.
 * @returns {string}
 */
function generateReporterToken() {
    const arr = crypto.getRandomValues(new Uint8Array(16));
    return 'RPT-' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
