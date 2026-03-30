/**
 * SMS Service — uses Twilio if configured, otherwise simulates the send
 */

const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
const authToken  = (process.env.TWILIO_AUTH_TOKEN  || '').trim();
const fromPhone  = (process.env.TWILIO_PHONE_NUMBER || '').trim();

// Only load Twilio when all three values are present
const twilioConfigured = accountSid.length > 0 && authToken.length > 0 && fromPhone.length > 0;
let twilioClient = null;

if (twilioConfigured) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio SMS service initialised.');
  } catch (err) {
    console.warn('Twilio init failed:', err.message);
  }
} else {
  console.log('Twilio not configured — SMS will be simulated.');
}

/**
 * Send (or simulate) a recovery SMS
 * @param {string} to          - client phone number
 * @param {string} clientName
 * @param {number} amount
 * @param {string|Date} dueDate
 * @param {string} description
 */
async function sendRecoverySms(to, clientName, amount, dueDate, description) {
  if (!to) {
    return { success: false, error: 'No recipient phone number' };
  }

  const body = [
    `Recouvra+ — Rappel de paiement`,
    `Bonjour ${clientName},`,
    `Vous avez une facture impayée de ${amount} € (échéance : ${new Date(dueDate).toLocaleDateString('fr-FR')}).`,
    description || 'Merci de régulariser votre situation.'
  ].join(' ');

  if (!twilioClient) {
    // Simulation mode — always returns success so the action is still saved
    console.log('SMS simulé (Twilio non configuré)');
    console.log('  Destinataire :', to);
    console.log('  Message      :', body);
    return { success: true, simulated: true, to, body };
  }

  try {
    const message = await twilioClient.messages.create({ body, from: fromPhone, to });
    console.log('Recovery SMS sent — SID:', message.sid);
    return { success: true, sid: message.sid };
  } catch (err) {
    console.error('Failed to send recovery SMS:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendRecoverySms };
