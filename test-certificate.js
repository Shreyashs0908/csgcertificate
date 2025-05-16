require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { generateCertificate } = require('./src/certificate-generator');

// AES encryption key and IV from environment variables
const AES_ENCRYPTION_KEY = process.env.AES_ENCRYPTION_KEY;
const AES_IV = process.env.AES_IV;

/**
 * Encrypts data using AES-256-CBC algorithm
 * @param {any} data - Data to encrypt
 * @returns {string} Encrypted data as base64 string
 */
function encryptWithAES(data) {
  try {
    // Convert data to JSON string if it's an object
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Create cipher using AES-256-CBC with the key and IV
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      crypto.scryptSync(AES_ENCRYPTION_KEY, 'salt', 32), // Generate 32-byte key
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

/**
 * Decrypts data that was encrypted using AES-256-CBC algorithm
 * @param {string} encryptedData - Encrypted data as base64 string
 * @returns {string} Decrypted data
 */
function decryptWithAES(encryptedData) {
  try {
    // Create decipher using AES-256-CBC with the key and IV
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      crypto.scryptSync(AES_ENCRYPTION_KEY, 'salt', 32), // Generate 32-byte key
      Buffer.from(AES_IV.padEnd(16, '0').slice(0, 16)) // Ensure IV is exactly 16 bytes
    );
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting certificate data:', error);
    throw new Error('Failed to decrypt certificate data');
  }
}

// Test certificate data
const testCertificate = {
  certificateId: "CSG-TEST12345",
  userId: "user123",
  name: "John Doe",
  email: "john.doe@example.com",
  issueDate: new Date().toISOString(),
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  isValid: true
};

// Encrypt the certificate data
console.log("Encrypting certificate data...");
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