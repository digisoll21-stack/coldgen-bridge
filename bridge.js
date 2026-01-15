// bridge.js (Requires: npm install express nodemailer cors)
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors()); // Allows the UI to talk to this script
app.use(express.json());

app.post('/dispatch', async (req, res) => {
  const { mailbox, lead, subject, body } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      host: mailbox.smtpHost,
      port: mailbox.smtpPort,
      secure: mailbox.smtpPort === 465,
      auth: { user: mailbox.email, pass: mailbox.smtpPassword }
    });

    await transporter.sendMail({
      from: `"${mailbox.senderName}" <${mailbox.email}>`,
      to: lead.email,
      subject: subject,
      text: body
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check for the SaaS
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bridge is running' });
});

app.listen(3001, () => console.log('SDR Bridge running on port 3001'));
