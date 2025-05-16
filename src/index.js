require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { generateCertificate } = require('./certificate-generator');
const { decryptWithAES, AES_ENCRYPTION_KEY, AES_IV} = require('./aes-decryption');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));

// Ensure certificates directory exists
const certificatesDir = path.join(__dirname, '../public/certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

// Routes
app.get('/', (req, res) => {
  res.send('CSG Certificate Generation Service');
});

// Certificate generation endpoint
app.post('/details', async (req, res) => {
  try {
    const { encryptedData } = req.body;
    
    if (!encryptedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Encrypted certificate data is required' 
      });
    }
    
    console.log('Received encrypted data:', encryptedData);
    
    // Decrypt the data
    const decryptedData = decryptWithAES(encryptedData);
    console.log('Decrypted data:', decryptedData);
    
    // Parse the decrypted JSON
    const certificateData = JSON.parse(decryptedData);
    
    // Validate required fields
    const requiredFields = ['certificateId', 'userId', 'name', 'email'];
    for (const field of requiredFields) {
      if (!certificateData[field]) {
        return res.status(400).json({ 
          success: false, 
          message: `Missing required field: ${field}` 
        });
      }
    }
    
    // Generate certificate
    const certificatePath = await generateCertificate(certificateData);
    
    // Return success response with certificate URL
    const certificateUrl = `/certificates/${path.basename(certificatePath)}`;
    
    return res.status(200).json({
      success: true,
      message: 'Certificate generated successfully',
      certificateUrl,
      certificateId: certificateData.certificateId,
      // Include encryption details for testing purposes only
      // Remove this in production
      encryptionDetails: {
        algorithm: 'AES-128-CBC',
        key: AES_ENCRYPTION_KEY,
        iv: AES_IV
      }
    });
    
  } catch (error) {
    console.error('Error generating certificate:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate certificate: ' + error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Certificate generation service running on port ${PORT}`);
});