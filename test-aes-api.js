require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// AES encryption key and IV
const AES_ENCRYPTION_KEY = process.env.AES_ENCRYPTION_KEY || 'CSG@2025';
const AES_IV = process.env.AES_IV || 'CSG_IV25';

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
  certificateId: "CSG-AES-API-TEST",
  userId: "user789",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
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

// Send the encrypted data to the API
console.log("\nSending encrypted data to API...");
axios.post('http://localhost:3000/details', { encryptedData })
  .then(response => {
    console.log("API Response:", response.data);
    
    // Download the certificate
    if (response.data.success && response.data.certificateUrl) {
      console.log("\nCertificate generated successfully!");
      console.log("Certificate URL:", response.data.certificateUrl);
      
      // Display encryption details if available
      if (response.data.encryptionDetails) {
        console.log("\nEncryption Details:");
        console.log("Algorithm:", response.data.encryptionDetails.algorithm);
        console.log("Key:", response.data.encryptionDetails.key);
        console.log("IV:", response.data.encryptionDetails.iv);
      }
    } else {
      console.error("Error generating certificate:", response.data.message);
    }
  })
  .catch(error => {
    console.error("Error calling API:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  });