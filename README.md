# CSG Certificate Generation Service (Windows Compatible)

This is a Windows-compatible version of the CSG Certificate Generation Service. It has been modified to work without native dependencies that require Visual Studio build tools. The service generates certificates for users who have successfully completed the CSG course. It receives encrypted certificate data, decrypts it, and generates a downloadable PDF certificate.

## Features

- Secure certificate generation using AES encryption (implemented as AES-128-CBC)
- PDF certificate generation with custom design (using PDFKit)
- RESTful API for certificate requests
- Downloadable certificates
- Windows compatibility (no native dependencies)

## API Endpoints

### Generate Certificate

```
POST /details
```

**Request Body:**
```json
{
  "encryptedData": "base64EncodedEncryptedData"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate generated successfully",
  "certificateUrl": "/certificates/CSG-12345678.pdf",
  "certificateId": "CSG-12345678"
}
```

## Certificate Data Format

The encrypted data should contain the following information:

```json
{
  "certificateId": "CSG-12345678",
  "userId": "user123",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "issueDate": "2023-01-01T00:00:00.000Z",
  "expiryDate": "2024-01-01T00:00:00.000Z"
}
```

## Security

- All certificate data is encrypted using DES encryption (implemented as AES-128-CBC)
- The encryption key is stored securely in environment variables
- Only authorized CSG applications can generate certificates

## Installation for Windows

1. Extract the zip file to a directory of your choice
2. Open a command prompt or PowerShell window in the extracted directory
3. Run the following command to install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with the following variables:
   ```
   PORT=3000
   DES_KEY=CSG@2025
   DES_IV=CSG_IV25
   ```
5. Start the server: `npm start`

## Troubleshooting Windows Installation

If you encounter any issues:

1. Make sure Node.js is installed (version 14 or higher recommended)
2. Check that the `.env` file is correctly configured
3. Ensure the port specified in the `.env` file is not already in use
4. Check the console output for any error messages

## Documentation

For more detailed information about the DES encryption implementation, see [docs/des-encryption.md](docs/des-encryption.md).

## Development

- Run in development mode: `npm run dev`

## License

MIT