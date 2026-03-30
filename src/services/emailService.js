const nodemailer = require('nodemailer');

// Cache the resolved transporter instance (not the promise)
let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    // Use real SMTP credentials
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass }
    });
    console.log('Using SMTP:', smtpUser);
  } else {
    // Create a free Ethereal test account (no config needed)
    console.log('No SMTP credentials — creating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal test account:', testAccount.user);
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
  }

  return cachedTransporter;
}

/**
 * Send a recovery email to a client
 * @param {string} to        - client email address
 * @param {string} clientName
 * @param {number} amount
 * @param {string|Date} dueDate
 * @param {string} description
 */
async function sendRecoveryEmail(to, clientName, amount, dueDate, description) {
  if (!to) {
    console.warn('sendRecoveryEmail: no recipient address provided');
    return { success: false, error: 'No recipient email address' };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Recouvra+" <noreply@recouvra.com>',
    to,                          // ← always the CLIENT's email
    subject: 'Recouvra+ — Rappel de paiement',
    html: `
      <h2>Rappel de paiement — Recouvra+</h2>
      <p>Bonjour <strong>${clientName}</strong>,</p>
      <p>Nous vous rappelons que vous avez une facture impayée :</p>
      <ul>
        <li><strong>Montant :</strong> ${amount} €</li>
        <li><strong>Date d'échéance :</strong> ${new Date(dueDate).toLocaleDateString('fr-FR')}</li>
      </ul>
      ${description ? `<p><em>${description}</em></p>` : ''}
      <p>Merci de procéder au règlement dans les plus brefs délais.</p>
      <br/>
      <p>Cordialement,<br/>L'équipe Recouvra+</p>
    `
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Recovery email sent to:', to, '— messageId:', info.messageId);
    if (previewUrl) console.log('Preview URL (Ethereal):', previewUrl);
    return { success: true, messageId: info.messageId, previewUrl: previewUrl || null };
  } catch (err) {
    console.error('Failed to send recovery email:', err.message);
    // Reset cache so next call retries transporter creation
    cachedTransporter = null;
    return { success: false, error: err.message };
  }
}

module.exports = { sendRecoveryEmail };
