const express = require('express');
const path = require('path');
const cors = require('cors');
const { generateCertificate } = require('./src/certificate-generator');

const app = express();
const PORT = process.env.PORT || 12000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Route to generate a certificate
app.post('/api/generate-certificate', async (req, res) => {
  try {
    const certificateData = req.body;
    
    if (!certificateData || !certificateData.name || !certificateData.certificateId) {
      return res.status(400).json({ error: 'Missing required certificate data' });
    }
    
    const pdfPath = await generateCertificate(certificateData);
    const pdfFilename = path.basename(pdfPath);
    
    res.json({
      success: true,
      certificateUrl: `/certificates/${pdfFilename}`,
      message: `Certificate generated successfully for ${certificateData.name}`
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ error: 'Failed to generate certificate', details: error.message });
  }
});

// Route to view a certificate by ID
app.get('/view-certificate/:id', (req, res) => {
  const certificateId = req.params.id;
  res.redirect(`/certificates/${certificateId}.pdf`);
});

// Simple form to generate a certificate
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CSG Certificate Generator</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #1a5276;
        }
        form {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 5px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input {
          width: 100%;
          padding: 8px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          background-color: #1a5276;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #154360;
        }
        #result {
          margin-top: 20px;
          padding: 15px;
          border-radius: 5px;
          display: none;
        }
        .success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      </style>
    </head>
    <body>
      <h1>CSG Certificate Generator</h1>
      <form id="certificateForm">
        <div>
          <label for="name">Full Name:</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div>
          <label for="certificateId">Certificate ID:</label>
          <input type="text" id="certificateId" name="certificateId" value="CSG-" required>
        </div>
        <button type="submit">Generate Certificate</button>
      </form>
      
      <div id="result"></div>
      
      <script>
        document.getElementById('certificateForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const name = document.getElementById('name').value;
          const email = document.getElementById('email').value;
          const certificateId = document.getElementById('certificateId').value;
          
          const resultDiv = document.getElementById('result');
          resultDiv.className = '';
          resultDiv.style.display = 'none';
          
          try {
            const response = await fetch('/api/generate-certificate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                certificateId,
                name,
                email,
                userId: 'user-' + Date.now(),
                issueDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              resultDiv.className = 'success';
              resultDiv.innerHTML = \`
                <h3>Certificate Generated Successfully!</h3>
                <p>\${data.message}</p>
                <p><a href="\${data.certificateUrl}" target="_blank">View Certificate</a></p>
              \`;
            } else {
              resultDiv.className = 'error';
              resultDiv.innerHTML = \`
                <h3>Error</h3>
                <p>\${data.error}</p>
                <p>\${data.details || ''}</p>
              \`;
            }
          } catch (error) {
            resultDiv.className = 'error';
            resultDiv.innerHTML = \`
              <h3>Error</h3>
              <p>Failed to generate certificate: \${error.message}</p>
            \`;
          }
          
          resultDiv.style.display = 'block';
        });
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});