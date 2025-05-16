require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { generateCertificate } = require('./src/certificate-generator');
const { decryptWithAES, AES_ENCRYPTION_KEY, AES_IV } = require('./src/des-decryption');

/**
 * Encrypts data using AES-like algorithm (AES-128-CBC)
 * @param {any} data - Data to encrypt
 * @returns {string} Encrypted data as base64 string
 */
function encryptWithAES(data) {
  try {
    // Convert data to JSON string if it's an object
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Create cipher using AES-128-CBC with the key and IV
    const cipher = crypto.createCipheriv(
      'aes-128-cbc', 
      crypto.scryptSync(AES_ENCRYPTION_KEY, 'salt', 16), // Generate 16-byte key
      Buffer.from(AES_IV.padEnd(16, '0').slice(0, 16)) // Ensure IV is exactly 16 bytes
    );
    
    // Encrypt the data
    let encrypted = cipher.update(dataString, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return encrypted;
  } catch (error) {
    console.error('Error encrypting certificate data:', error);
    throw new Error('Failed to encrypt certificate data');
  }
}

// Test certificate data
const testCertificate = {
  certificateId: "CSG-AES12345",
  userId: "user456",
  name: "Jane Smith",
  email: "jane.smith@example.com",
  issueDate: new Date().toISOString(),
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  isValid: true
};

// Display the encryption key and IV
console.log("AES Encryption Key:", AES_ENCRYPTION_KEY);
console.log("AES IV:", AES_IV);

// Encrypt the certificate data
console.log("\nEncrypting certificate data...");
const encryptedData = encryptWithAES(testCertificate);
console.log("Encrypted data:", encryptedData);

// Decrypt the certificate data
console.log("\nDecrypting certificate data...");
const decryptedData = decryptWithAES(encryptedData);
console.log("Decrypted data:", decryptedData);
const parsedData = JSON.parse(decryptedData);
console.log("Parsed data:", parsedData);

// Generate certificate
console.log("\nGenerating certificate...");
generateCertificate(parsedData)
  .then(certificatePath => {
    console.log("Certificate generated successfully!");
    console.log("Certificate path:", certificatePath);
    console.log("Certificate URL:", `/certificates/${path.basename(certificatePath)}`);
  })
  .catch(error => {
    console.error("Error generating certificate:", error);
  });