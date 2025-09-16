import { toast } from "@/hooks/use-toast";
import { convertImageToHTML as convertImageToHTMLAPI } from "@/lib/api";

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "email" | "number" | "file" | "date";
  placeholder?: string;
  required?: boolean;
}

export interface ParsedTemplate {
  html: string;
  fields: TemplateField[];
  images: string[];
}

export const parseHTMLTemplate = (htmlContent: string): ParsedTemplate => {
  try {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Find all placeholder patterns {{VARIABLE_NAME}}
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const matches = htmlContent.match(placeholderRegex) || [];
    const fields: TemplateField[] = [];
    const foundKeys = new Set<string>();

    // Process each unique placeholder
    matches.forEach(match => {
      const key = match.replace(/[{}]/g, '');
      if (!foundKeys.has(key)) {
        foundKeys.add(key);
        
        const field: TemplateField = {
          key,
          label: formatFieldLabel(key),
          type: getFieldType(key),
          placeholder: `Enter ${formatFieldLabel(key).toLowerCase()}`,
          required: true
        };
        
        fields.push(field);
      }
    });

    // Find image sources for upload fields
    const images: string[] = [];
    const imgElements = doc.querySelectorAll('img');
    imgElements.forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.includes('{{') && src.includes('}}')) {
        images.push(src);
      }
    });

    return {
      html: htmlContent,
      fields: fields.sort((a, b) => a.label.localeCompare(b.label)),
      images
    };
  } catch (error) {
    console.error('Error parsing HTML template:', error);
    throw new Error('Failed to parse HTML template');
  }
};

export const processImageToHTML = async (imageFile: File): Promise<ParsedTemplate> => {
  try {
    // Create FormData for the API call
    const formData = new FormData();
    formData.append('image', imageFile);

    // First, extract text using OCR
    const ocrText = await extractTextFromImage(imageFile);
    
    // Then convert to HTML using OpenAI
    const htmlResult = await convertImageToHTMLAPI(imageFile);
    
    // Parse the generated HTML
    return parseHTMLTemplate(htmlResult.html);
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image. Please try again.');
  }
};

const extractTextFromImage = async (imageFile: File): Promise<string> => {
  // This would use Tesseract.js for OCR
  // For now, return a mock response
  return "Sample OCR text extracted from image";
};

const convertImageToHTML = async (imageFile: File): Promise<{ html: string }> => {
  try {
    return await convertImageToHTMLAPI(imageFile);
  } catch (error) {
    console.error('Error converting image to HTML:', error);
    throw error;
  }
};

const formatFieldLabel = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getFieldType = (key: string): TemplateField['type'] => {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.includes('email')) return 'email';
  if (lowerKey.includes('date')) return 'date';
  if (lowerKey.includes('price') || lowerKey.includes('amount') || lowerKey.includes('total')) return 'number';
  if (lowerKey.includes('logo') || lowerKey.includes('image') || lowerKey.includes('photo')) return 'file';
  
  return 'text';
};

export const generateReceiptHTML = (template: string, formData: Record<string, any>): string => {
  let html = template;
  
  // Replace all placeholders with form data
  Object.entries(formData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value || '');
  });
  
  return html;
};

export const getTemplateHTML = (templateId: string): string => {
  const templates: Record<string, string> = {
    beacons: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Your Beacons.ai Receipt</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <style>
      body, .wrapper { background-color: #EAEAEA; margin: 0; padding: 0; }
      .receipt-container { max-width: 600px; margin: 0 auto; background: #fff; padding: 24px 0 0 0; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);}
      .logo { display: block; margin: 0 auto 16px auto; border-radius: 1000px; width: 120px; }
      .thankyou { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 8px; }
      .order-title { text-align: center; font-size: 20px; margin-bottom: 20px;}
      .order-summary { width: 100%; background: #fafafa; border-radius: 6px; padding: 16px; margin-bottom: 24px;}
      .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px;}
      .summary-label { color: #555;}
      .summary-value { color: #111;}
      .product-row { display: flex; align-items: center; gap: 14px; margin-bottom: 10px;}
      .product-image { width: 72px; border-radius: 6px; background: #eee;}
      .product-title { font-size: 16px; font-weight: 600;}
      .product-price { color: #2848F0; font-weight: 700; font-size: 17px;}
      .btn { display: inline-block; margin: 18px 0; padding: 12px 22px; background: #2848F0; color: #fff; font-weight: 600; border-radius: 7px; text-decoration: none; font-size: 15px;}
      .feedback { background: #fff; border-radius: 8px; padding: 18px; margin: 0 0 24px 0; text-align: center;}
      .feedback h2 { font-size: 17px; margin-bottom: 12px;}
      .footer-text { color: #757575; font-size: 13px; text-align: center; margin-top: 30px;}
      @media (max-width:600px) {
        .receipt-container { padding: 0 2vw; }
        .product-row { flex-direction: column; align-items: flex-start; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="receipt-container">
        <!-- Logo -->
        <a href="#">
          <img class="logo" src="{{SELLER_LOGO_URL}}" alt="{{SELLER_NAME}}'s profile picture">
        </a>
        <div class="thankyou">Thanks for your order, {{BUYER_NAME}}! 🙏</div>
        <div class="order-title"><strong>{{PRODUCT_NAME}}</strong></div>

        <div class="order-summary">
          <div class="summary-row">
            <div class="summary-label">Date:</div>
            <div class="summary-value">{{DATE}}</div>
          </div>
          <div class="summary-row">
            <div class="summary-label">Order #:</div>
            <div class="summary-value">{{ORDER_ID}}</div>
          </div>
          <div class="product-row">
            <img class="product-image" src="{{PRODUCT_IMAGE_URL}}" alt="Product image">
            <div>
              <div class="product-title">{{PRODUCT_NAME}}</div>
              <div class="product-price">{{PRICE}}</div>
            </div>
          </div>
          <div style="margin-top:10px;">
            <a class="btn" href="{{ACCESS_LINK}}" target="_blank">Access link</a>
          </div>
        </div>

        <div style="text-align:center; margin-bottom:18px;">
          <a href="{{CUSTOMER_PORTAL_URL}}" target="_blank">Manage your order in the customer portal</a>
        </div>

        <div class="feedback">
          <h2>Your feedback matters!</h2>
          <p>Share your experience and help others with your product review!</p>
          <a class="btn" href="#" target="_blank">Leave a review</a>
        </div>

        <div class="footer-text">
          You are getting this receipt email because you bought a product from
          <a href="#" target="_blank" style="color:#2848F0;font-weight:600;text-decoration:none;">{{SELLER_NAME}}</a>.
          <br>If you have any questions or need assistance, contact {{SELLER_NAME}} directly.<br><br>
          <a href="#" style="color:#757575;text-decoration:underline;">Unsubscribe</a> from these notifications.
        </div>
        <div style="text-align:center; margin-top:22px;">
          <img src="https://cdn.beacons.ai/images/beacons_assets/made-with-beacons.png" alt="made with beacons" style="height:38px;">
        </div>
      </div>
    </div>
  </body>
</html>`,

    stanstore: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Stan Store Receipt</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      background: #f6f9fc;
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .receipt-container {
      background: #fff;
      max-width: 430px;
      margin: 40px auto;
      border-radius: 16px;
      box-shadow: 0 4px 18px rgba(50,50,93,0.06), 0 1.5px 8px rgba(0,0,0,0.03);
      padding: 32px 24px 24px 24px;
    }
    .logo-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .logo-row img {
      height: 42px;
    }
    .store-name {
      font-size: 1.3em;
      font-weight: bold;
      color: #23272e;
      margin-bottom: 5px;
      text-align: center;
      letter-spacing: 0.01em;
    }
    .receipt-id {
      color: #8898aa;
      text-align: center;
      font-size: 0.97em;
      margin-bottom: 22px;
    }
    .summary-table {
      width: 100%;
      margin-bottom: 26px;
      border-collapse: collapse;
    }
    .summary-table td {
      font-size: 1.08em;
      padding: 8px 0;
      color: #525f7f;
      border-bottom: 1px solid #f0f1f6;
    }
    .summary-table tr:last-child td {
      border-bottom: none;
    }
    .summary-table .label {
      color: #8898aa;
      font-size: 0.97em;
      text-transform: uppercase;
      font-weight: bold;
    }
    .summary-table .value {
      text-align: right;
      font-weight: 500;
      color: #23272e;
    }
    .product-row {
      margin-bottom: 10px;
      font-size: 1.08em;
      display: flex;
      justify-content: space-between;
    }
    .support {
      margin-top: 32px;
      font-size: 0.96em;
      color: #697386;
      text-align: center;
    }
    .support a {
      color: #625afa;
      text-decoration: none;
      font-weight: 500;
    }
    @media (max-width: 500px) {
      .receipt-container {
        padding: 14px 2vw 18px 2vw;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="logo-row">
      <img src="https://stripe-images.stripecdn.com/notifications/hosted/20180110/Header/Left.png" alt="Stan Store Logo Left">
      <img src="https://stripe-images.s3.amazonaws.com/emails/acct_1FYbdJIYtv5oAFkS/2/twelve_degree_icon@2x.png" alt="Stan Store Icon" style="height: 42px;">
      <img src="https://stripe-images.stripecdn.com/notifications/hosted/20180110/Header/Right.png" alt="Stan Store Logo Right">
    </div>
    <div class="store-name">Stan – Your Creator Store</div>
    <div class="receipt-id">Receipt #{{RECEIPT_ID}}</div>
    <div class="product-row">
      <span>{{PRODUCT_NAME}} &lt;&gt; {{BUYER_NAME}}</span>
      <span style="font-weight:bold;">{{PRODUCT_PRICE}}</span>
    </div>
    <table class="summary-table">
      <tr>
        <td class="label">Amount paid</td>
        <td class="value">{{AMOUNT_PAID}}</td>
      </tr>
      <tr>
        <td class="label">Date paid</td>
        <td class="value">{{DATE_PAID}}</td>
      </tr>
      <tr>
        <td class="label">Payment method</td>
        <td class="value">
          <img src="https://stripe-images.stripecdn.com/emails/receipt_assets/card/{{PAYMENT_METHOD}}-dark@2x.png" alt="{{PAYMENT_METHOD}}" style="vertical-align:middle; height: 16px;">
          &nbsp;– {{CARD_LAST4}}
        </td>
      </tr>
    </table>
    <div class="support">
      If you have any questions, visit our support site at
      <a href="https://help.stan.store" target="_blank">https://help.stan.store</a>,<br>
      or contact the creator at <a href="mailto:{{SELLER_EMAIL}}">{{SELLER_EMAIL}}</a>.
    </div>
  </div>
</body>
</html>`,

    fanbasis: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - Fanbasis</title>
  <style>
    body { margin: 0; padding: 0; background: #ffffff; font-family: Arial, Helvetica, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    .header { background-color: #FFF8E8; padding: 32px 20px 28px 20px; border-bottom: 1px solid #f0e6cf; text-align: center; }
    .header h1 { margin: 0 0 18px 0; font-size: 34px; line-height: 1.2; font-weight: 800; color: #111111; }
    .header p { margin: 0; line-height: 1.6; color: #111111; }
    .dark-card { background-color: #1F1F1F; padding: 28px 24px 26px 24px; color: #F5F5F5; }
    .dark-card h2 { margin: 0; font-size: 28px; line-height: 1.2; font-weight: 800; text-align: center; padding-bottom: 22px; }
    .detail-row { padding: 8px 0; font-size: 16px; line-height: 1.6; color: #F5F5F5; }
    .detail-row span { opacity: 0.92; }
    .product-date { padding: 18px 0 2px 0; }
    .product-date td:first-child { font-size: 17px; font-weight: 800; color: #F5F5F5; }
    .product-date td:last-child { font-size: 17px; color: #EDEDED; text-align: right; }
    .price { padding: 12px 0 18px 0; font-size: 20px; font-weight: 800; color: #F5F5F5; text-align: right; }
    .payment-note { padding: 8px 0; font-size: 16px; line-height: 1.6; color: #F5F5F5; font-weight: bold; }
    .divider { padding: 18px 0 14px 0; border-top: 1px solid #3A3A3A; }
    .totals td { padding: 6px 0; font-size: 16px; color: #EDEDED; }
    .totals td:first-child { text-align: left; }
    .totals td:last-child { text-align: right; font-size: 18px; font-weight: 800; }
    @media (max-width: 768px) { .header, .dark-card { padding: 20px 10px; } .header h1 { font-size: 24px; } }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#FFFFFF" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:768px; width:100%;">
          <tr>
            <td class="header">
              <h1>Payment Confirmation</h1>
              <p>Thank you for purchasing <b>{{PRODUCT_NAME}}</b> from <b>{{SELLER_NAME}}</b>. Your purchase is confirmed, and we are excited to have you on board.</p>
            </td>
          </tr>
          <tr>
            <td class="dark-card">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding:0 0 22px 0;">
                    <h2>Order summary</h2>
                  </td>
                </tr>
                <tr>
                  <td class="detail-row">Name: {{BUYER_NAME}}</td>
                </tr>
                <tr>
                  <td class="detail-row">Email: {{BUYER_EMAIL}}</td>
                </tr>
                <tr>
                  <td class="detail-row">Seller name: {{SELLER_NAME}}</td>
                </tr>
                <tr>
                  <td class="product-date">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>{{PRODUCT_NAME}}</td>
                        <td>Order date: {{DATE}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="price">{{PRICE}}</td>
                </tr>
                <tr>
                  <td class="payment-note">Full payment received for the complete courses</td>
                </tr>
                <tr>
                  <td class="divider">&nbsp;</td>
                </tr>
                <tr>
                  <td>
                    <table class="totals" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>Subtotal:</td>
                        <td>{{SUBTOTAL}}</td>
                      </tr>
                      <tr>
                        <td>Order Total:</td>
                        <td>{{TOTAL}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  };

  return templates[templateId] || '';
};