const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// USE YOUR ACTUAL CREDENTIALS HERE
const YOUR_EMAIL = "groupanimators4@gmail.com"; 
const YOUR_APP_PASSWORD = "pmzg eboq hrrv czbp"; // 👈 PUT THE 16-CHAR APP PASSWORD HERE

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: YOUR_EMAIL,
    pass: YOUR_APP_PASSWORD
  }
});

// Test email connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ SERVER ERROR - Email not configured:', error.message);
    console.log('⚠️ Make sure you are using an App Password, not regular password');
  } else {
    console.log('✅ Server is ready to send emails');
  }
});

// Serve HTML form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Send me a message</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: linear-gradient(145deg, #f5f7fa 0%, #e9edf5 100%);
          font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .card {
          background: #ffffff;
          box-shadow: 0 30px 50px rgba(0,0,0,0.08);
          border-radius: 2.5rem;
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 480px;
        }
        h1 {
          font-size: 2rem;
          color: #0b1e33;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: #4a5b6e;
          font-size: 0.9rem;
          margin-bottom: 2rem;
          border-left: 4px solid #2563eb;
          padding-left: 1rem;
        }
        .form-group { margin-bottom: 1.5rem; }
        label {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #1e293b;
          display: block;
          margin-bottom: 0.4rem;
        }
        input, textarea {
          width: 100%;
          padding: 0.9rem 1.2rem;
          font-size: 1rem;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 1rem;
          outline: none;
          font-family: inherit;
          transition: 0.2s;
        }
        input:focus, textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
        }
        textarea {
          min-height: 130px;
          resize: vertical;
        }
        .btn {
          width: 100%;
          padding: 1rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn:hover { background: #2563eb; }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .status {
          margin-top: 1rem;
          text-align: center;
          font-size: 0.9rem;
          padding: 0.7rem;
          border-radius: 2rem;
          display: none;
        }
        .status.success {
          display: block;
          background: #dcfce7;
          color: #14532d;
        }
        .status.error {
          display: block;
          background: #fee2e2;
          color: #991b1b;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>📨 Send me a message</h1>
        <p class="subtitle">I'll receive it directly in my inbox.</p>
        <form id="emailForm">
          <div class="form-group">
            <label>🧑 Your name</label>
            <input type="text" id="senderName" placeholder="Alex Rivera" required>
          </div>
          <div class="form-group">
            <label>💬 Message</label>
            <textarea id="messageText" placeholder="Hi! I wanted to reach out..." required></textarea>
          </div>
          <button type="submit" class="btn" id="submitBtn">✉️ Send message</button>
          <div id="statusBox" class="status"></div>
        </form>
      </div>
      <script>
        const form = document.getElementById('emailForm');
        const submitBtn = document.getElementById('submitBtn');
        const statusBox = document.getElementById('statusBox');
        const nameInput = document.getElementById('senderName');
        const messageInput = document.getElementById('messageText');
        
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = nameInput.value.trim();
          const message = messageInput.value.trim();
          
          if (!name || !message) {
            showStatus('Please fill in all fields.', 'error');
            return;
          }
          
          submitBtn.disabled = true;
          submitBtn.textContent = '⏳ Sending...';
          statusBox.className = 'status';
          statusBox.style.display = 'none';
          
          try {
            const response = await fetch('/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, message })
            });
            
            const data = await response.json();
            
            if (data.success) {
              showStatus('✅ Message sent! Check your inbox.', 'success');
              form.reset();
            } else {
              showStatus('❌ ' + (data.error || 'Something went wrong. Please try again.'), 'error');
            }
          } catch (err) {
            showStatus('❌ Could not connect to server. Please try again later.', 'error');
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '✉️ Send message';
          }
        });
        
        function showStatus(text, type) {
          statusBox.textContent = text;
          statusBox.className = 'status ' + type;
          statusBox.style.display = 'block';
        }
      </script>
    </body>
    </html>
  `);
});

// Endpoint to send email
app.post('/send-email', async (req, res) => {
  const { name, message } = req.body;
  
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }
  
  try {
    console.log('📤 Attempting to send email...');
    console.log('From:', name);
    console.log('Message length:', message.length);
    
    const info = await transporter.sendMail({
      from: `"Website Contact" <${YOUR_EMAIL}>`,
      to: YOUR_EMAIL,
      subject: `📩 New message from ${name}`,
      text: `Name: ${name}\n\nMessage:\n${message}`,
      html: `
        <h2>New Message from Website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    
    // Check for common errors
    let errorMessage = 'Failed to send email. ';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. You MUST use an App Password, not your regular Gmail password.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// Use PORT from environment (Render sets this automatically)
const PORT = process.env.PORT || 3230;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📧 Email configured for:', YOUR_EMAIL);
  console.log('⚠️ IMPORTANT: Make sure you are using a Gmail App Password, not regular password!');
});
