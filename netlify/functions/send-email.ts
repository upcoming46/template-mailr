import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend('re_9X1Y39Bu_8LrqUE3xb87HJ9Ya95jTLgk1');

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { to, subject, fromName, fromEmail, html } = JSON.parse(event.body || '{}');

    if (!to || !subject || !html) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
      };
    }

    const emailData = {
      from: fromName && fromEmail ? `${fromName} <${fromEmail}>` : 'Receipt Generator <no-reply@receipts.com>',
      to: [to],
      subject: subject,
      html: html,
    };

    const data = await resend.emails.send(emailData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        messageId: data.id,
        message: 'Email sent successfully' 
      }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};