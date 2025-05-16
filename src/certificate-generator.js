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
    
    // Path to certificate template image
    const certificateImagePath = path.join(__dirname, '../templates/images/Certificate.jpg');
    
    // Create PDF
    const pdfPath = path.join(certificatesDir, `${certificateId}.pdf`);
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      layout: 'landscape' // Most certificates look better in landscape mode
    });
    
    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(pdfPath));
    
    // Add certificate background image
    doc.image(certificateImagePath, 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
      align: 'center',
      valign: 'center'
    });
    
    // Calculate positions based on the page dimensions
    const centerX = doc.page.width / 2;
    
    // Adjust these values based on the specific certificate image
    const nameY = doc.page.height * 0.38; // Position for the name - moved higher
    const completionTextY = doc.page.height * 0.46; // Position for completion text - moved higher
    const detailsStartY = doc.page.height * 0.58; // Position for certificate details - moved higher
    
    // Add name (centered and prominent)
    doc.fontSize(32)
       .font('Helvetica-Bold')
       .fillColor('#1a5276')
       .text(name, 0, nameY, {
         width: doc.page.width,
         align: 'center'
       });
    
    // Add completion text
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#2c3e50')
       .text('has successfully completed the CSG course', 0, completionTextY, {
         width: doc.page.width,
         align: 'center'
       });
    
    // Set position for certificate details
    let currentY = detailsStartY;
    
    // Add certificate details in a smaller font
    doc.fontSize(14)
       .fillColor('#2c3e50');
    
    // Add certificate ID
    doc.text(`Certificate ID: ${certificateId}`, 0, currentY, {
      width: doc.page.width,
      align: 'center'
    });
    
    currentY += 20;
    
    // Add issue date
    const formattedIssueDate = new Date(issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Issue Date: ${formattedIssueDate}`, 0, currentY, {
      width: doc.page.width,
      align: 'center'
    });
    
    currentY += 20;
    
    // Add expiry date
    const formattedExpiryDate = new Date(expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Valid Until: ${formattedExpiryDate}`, 0, currentY, {
      width: doc.page.width,
      align: 'center'
    });
    
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