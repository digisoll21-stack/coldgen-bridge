// bridge.js
// Requires: npm install express nodemailer cors

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// ================== CONFIG ==================
// Replace this with your SaaS frontend domain in production
const FRONTEND_URL = process.env.FRONTEND_URL || '*'; // '*' for testing only

app.use(cors({
  origin: FRONTEND_URL,
}));
app.use(express.json());

// ================== ROUTES ==================

// Health check for your SaaS
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bridge is running' });
});

// Dispatch email
app.post('/dispatch', async (req, res) => {
  const { mailbox, lead, subject, body } = req.body;

  if (!mailbox || !lead || !subject || !body) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: mailbox.smtpHost,
      port: mailbox.smtpPort,
      secure: mailbox.smtpPort === 465,
      auth: { user: mailbox.email, pass: mailbox.smtpPassword },
    });

    await transporter.sendMail({
      from: `"${mailbox.senderName}" <${mailbox.email}>`,
      to: lead.email,
      subject,
      text: body,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`SDR Bridge running on port ${PORT}`));
