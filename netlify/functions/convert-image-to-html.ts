import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
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
    // For now, return a mock HTML template since OCR and OpenAI integration would require more setup
    const mockHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .details { margin-bottom: 20px; }
    .total { font-weight: bold; font-size: 1.2em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Receipt</h1>
    <p>Thank you for your purchase, {{BUYER_NAME}}!</p>
  </div>
  <div class="details">
    <p><strong>Product:</strong> {{PRODUCT_NAME}}</p>
    <p><strong>Date:</strong> {{DATE}}</p>
    <p><strong>Order ID:</strong> {{ORDER_ID}}</p>
  </div>
  <div class="total">
    <p>Total: {{TOTAL_AMOUNT}}</p>
  </div>
</body>
</html>`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        html: mockHTML,
        message: 'HTML generated from image (mock implementation)' 
      }),
    };
  } catch (error) {
    console.error('Error processing image:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};