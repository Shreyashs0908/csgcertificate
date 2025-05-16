const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Generates a certificate PDF based on the provided data
 * @param {Object} certificateData - Certificate data
 * @returns {Promise<string>} Path to the generated certificate
 */
async function generateCertificate(certificateData) {
  try {
    const {
      certificateId,
      userId,
      name,
      email,
      issueDate = new Date().toISOString(),
      expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    } = certificateData;
    
    // Create directory if it doesn't exist
    const certificatesDir = path.join(__dirname, '../public/certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }
    
    // Create PDF
    const pdfPath = path.join(certificatesDir, `${certificateId}.pdf`);
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(pdfPath));
    
    // Add border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(3)
       .stroke('#1a5276');
    
    // Add title
    doc.fontSize(30)
       .font('Helvetica-Bold')
       .fillColor('#1a5276')
       .text('Certificate of Completion', { align: 'center' })
       .moveDown(1);
    
    // Add description
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#2c3e50')
       .text('This is to certify that', { align: 'center' })
       .moveDown(0.5);
    
    // Add name
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1a5276')
       .text(name, { align: 'center' })
       .moveDown(0.5);
    
    // Add completion text
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#2c3e50')
       .text('has successfully completed the CSG course', { align: 'center' })
       .moveDown(2);
    
    // Add certificate ID
    doc.fontSize(12)
       .text(`Certificate ID: ${certificateId}`, { align: 'center' })
       .moveDown(0.5);
    
    // Add issue date
    const formattedIssueDate = new Date(issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Issue Date: ${formattedIssueDate}`, { align: 'center' })
       .moveDown(0.5);
    
    // Add expiry date
    const formattedExpiryDate = new Date(expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Valid Until: ${formattedExpiryDate}`, { align: 'center' })
       .moveDown(3);
    
    // Add signature
    doc.fontSize(14)
       .font('Helvetica-Oblique')
       .text('CSG Authorized Signature', { align: 'center' });
    
    // Add horizontal line for signature
    const signatureY = doc.y - 30;
    doc.moveTo(doc.page.width / 2 - 100, signatureY)
       .lineTo(doc.page.width / 2 + 100, signatureY)
       .stroke();
    
    // Add metadata
    doc.info.Title = `CSG Certificate - ${name}`;
    doc.info.Author = 'CSG Certificate Service';
    doc.info.Subject = 'Certificate of Completion';
    doc.info.Keywords = 'certificate, completion, csg';
    
    // Finalize the PDF
    doc.end();
    
    console.log(`Certificate generated for ${name} with ID ${certificateId}`);
    
    return pdfPath;
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw new Error('Failed to generate certificate: ' + error.message);
  }
}

module.exports = {
  generateCertificate
};