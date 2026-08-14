import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendOtpEmail = async (toEmail, otp) => {
  // If not configured, print to console to act as fallback/local mock
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn(
      'EmailJS credentials are not configured in your .env file.\n' +
      'Simulated OTP Code: ' + otp
    );
    return { success: false, simulated: true };
  }

  try {
    const templateParams = {
      to_email: toEmail,
      otp_code: otp,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    
    console.log('EmailJS response:', response.status, response.text);
    return { success: true };
  } catch (error) {
    console.error('EmailJS error:', error);
    throw error;
  }
};
