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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Beacons.ai Receipt</title>
  <style>
    body { background-color: #efefef; font-family: Arial, sans-serif; color: #171722; margin: 0; padding: 0; }
    .container { max-width: 430px; margin: 36px auto; padding: 0; }
    .top-logo { width: 100%; text-align: center; margin-bottom: 18px; margin-top: 18px; }
    .top-logo img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 2px 12px rgba(90,90,90,0.12); }
    .section { background-color: #fff; padding: 18px 22px; border-radius: 8px; margin-bottom: 18px; box-shadow: 0 1px 5px rgba(25,25,50,0.04); }
    .thanks-box { text-align: center; font-size: 1.19rem; font-weight: 600; color: #212140; padding: 23px 12px 19px 12px; background: #fff; border-radius: 8px; margin-bottom: 18px; letter-spacing: 0.01em; box-shadow: 0 1px 5px rgba(25,25,50,0.04); }
    .emoji { font-size: 1.4em; vertical-align: -3px; margin-left: 4px; }
    .product-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; }
    .access-link { display: inline-block; background-color: #007BFF; color: #fff; text-decoration: none; padding: 8px 19px; border-radius: 4px; font-size: 14px; font-weight: 500; margin-left: 10px; }
    .order-summary img { width: 100%; border-radius: 5px; margin: 11px 0 8px 0; }
    .stars { text-align: center; font-size: 2.3em; letter-spacing: 7px; margin: 15px 0 0 0; user-select: none; }
    .star-link { color: #fff; text-decoration: none; text-shadow: 0 2px 8px #111, 0 1.5px 1.5px #444, 0 0.5px 1px #000; transition: transform 0.12s; padding: 0 2px; cursor: pointer; display: inline-block; background: #007BFF; border-radius: 4px; }
    .star-link:hover { color: #ffe066; transform: scale(1.13); text-shadow: 0 3px 12px #111, 0 2px 2px #222, 0 1px 1.5px #888; }
    .review-button { background-color: #007BFF; color: #fff; border: none; padding: 11px 28px; border-radius: 4px; margin-top: 16px; cursor: pointer; font-size: 15px; font-weight: 600; box-shadow: 0 2px 7px rgba(40,80,200,0.07); transition: background 0.2s; }
    .review-button:hover { background-color: #0056b3; }
    .beacons-branding { text-align: center; margin: 25px 0; }
    .beacons-branding img { width: 112px; opacity: 0.92; }
    .beacons-branding p { color: #86869a; margin-top: 11px; font-size: 0.98em; }
    a { color: #007BFF; text-decoration: none; }
    a:hover { text-decoration: underline; }
    @media (max-width: 480px) { .container { max-width: 100%; margin: 10px; } .top-logo img { width: 60px; height: 60px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-logo">
      <img src="{{SELLER_LOGO_URL}}" alt="Seller Logo">
    </div>
    <div class="thanks-box">
      Thanks for your order, {{BUYER_NAME}}! <span class="emoji">🙏</span>
    </div>
    <div class="section">
      <div class="product-header">
        <div>
          <strong>{{PRODUCT_NAME}}</strong><br>
          <span style="color:#888;font-size:0.97em;">{{UNTITLED_URL}}</span>
        </div>
        <a href="{{ACCESS_LINK}}" class="access-link">Access link</a>
      </div>
    </div>
    <div class="section order-summary">
      <h3>Order Summary</h3>
      <p><strong>Date:</strong> {{DATE}}</p>
      <p><strong>Order #:</strong> {{ORDER_ID}}</p>
      <img src="{{PRODUCT_IMAGE_URL}}" alt="{{PRODUCT_NAME}}">
      <p>{{PRODUCT_NAME}}</p>
      <p><strong>{{PRICE}}</strong></p>
      <p style="color:#7d7d90;font-size:0.97em;">
        Visit the <a href="{{CUSTOMER_PORTAL_URL}}" target="_blank">customer portal</a>
        to manage your order and access your content any time.
      </p>
    </div>
    <div class="section" style="text-align: center;">
      <h3>Your feedback matters!</h3>
      <p>Share your experience and help others with your product review!</p>
      <div class="stars">
        <a class="star-link" href="#" title="1-star">★</a><a class="star-link" href="#" title="2-star">★</a><a class="star-link" href="#" title="3-star">★</a><a class="star-link" href="#" title="4-star">★</a><a class="star-link" href="#" title="5-star">★</a>
      </div>
      <a href="#"><button class="review-button">Leave a review</button></a>
    </div>
    <div class="section">
      <h3>Need help?</h3>
      <p>If you have any questions or need assistance with your order, feel free to contact {{SELLER_NAME}} directly.</p>
    </div>
    <div class="beacons-branding">
      <a href="https://beacons.ai/my-purchases"><img src="https://cdn.beacons.ai/images/beacons_assets/made-with-beacons.png" alt="Beacons"></a>
      <p>You are getting this receipt email because you bought a product from {{SELLER_NAME}}.<br>If you'd like to stop receiving future marketing messages, please <a href="#">unsubscribe</a>.</p>
    </div>
  </div>
</body>
</html>`,

    stanstore: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt from Stan - Your Creator Store</title>
  <style>
    body { background: #171722; font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; color: #ededed; margin: 0; padding: 0; }
    .stan-container { width: 750px; margin: 40px auto; background: #171722; border-radius: 18px; box-shadow: 0 4px 40px rgba(0,0,0,0.13); overflow: hidden; }
    .stan-header-bg { position: relative; width: 100%; height: 154px; background: #171722; overflow: visible; display: flex; align-items: flex-end; }
    .header-left { background: #18181f; width: 38%; height: 100%; clip-path: polygon(0 0, 100% 35%, 100% 100%, 0 100%); z-index: 1; }
    .header-center { background: #fff; width: 22%; height: 100%; z-index: 2; position: relative; }
    .header-right { background: #ececf1; width: 40%; height: 100%; clip-path: polygon(0 35%, 100% 0, 100% 100%, 0 100%); z-index: 1; }
    .stan-logo-holder { position: absolute; left: 50%; top: 84px; transform: translate(-50%, -50%); width: 108px; height: 108px; background: #fff; border-radius: 50%; box-shadow: 0 8px 24px rgba(25, 21, 74, 0.16), 0 1.5px 5px rgba(0,0,0,0.13); display: flex; align-items: center; justify-content: center; z-index: 5; }
    .stan-logo-holder img { width: 62px; height: 62px; display: block; }
    .stan-header-spacer { height: 48px; }
    .stan-content { padding: 8px 54px 0 54px; }
    .receipt-title { font-size: 2.13rem; font-weight: 600; color: #e5e2fa; text-align: center; margin-top: 0; margin-bottom: 3px; letter-spacing: 0.01em; }
    .receipt-id { text-align: center; font-size: 1.14rem; color: #a7a6bb; margin-bottom: 36px; margin-top: 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 1.18rem; font-weight: 400; }
    .info-col { min-width: 180px; }
    .info-label { color: #bcbcdc; font-size: 0.97rem; font-weight: 500; letter-spacing: 0.10px; margin-bottom: 2px; }
    .summary-section { margin-top: 16px; margin-bottom: 18px; }
    .summary-title { color: #bcbcdc; font-weight: 600; font-size: 1.19rem; letter-spacing: 0.4px; margin-bottom: 4px; }
    .summary-card { background: #19192a; border-radius: 10px; margin-top: 7px; margin-bottom: 18px; overflow: hidden; border: 1px solid #222235; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 32px 10px 32px; border-bottom: 1px solid #232338; color: #ededed; font-size: 1.11rem; font-weight: 400; }
    .summary-row:last-child { border-bottom: none; padding-bottom: 17px; font-weight: bold; color: #fff; font-size: 1.18rem; }
    .support { text-align: left; color: #b8b8c5; font-size: 1.11rem; line-height: 1.72; width: 98%; margin: 0 auto; margin-top: 18px; }
    .support a { color: #8a6fff; text-decoration: underline; word-break: break-all; }
    @media (max-width: 900px) { .stan-container { width: 98vw; } .stan-content { padding: 2vw; } }
    @media (max-width: 700px) { .stan-logo-holder { width: 80px; height: 80px; top: 68px; } .stan-logo-holder img { width: 44px; height: 44px; } .stan-header-bg { height: 88px; } .stan-content { padding: 8px 6vw 0 6vw; } .receipt-title { font-size: 1.19rem; } .info-row { flex-direction: column; } }
  </style>
</head>
<body>
  <div class="stan-container">
    <div class="stan-header-bg">
      <div class="header-left"></div>
      <div class="header-center"></div>
      <div class="header-right"></div>
      <div class="stan-logo-holder">
        <img src="https://ci3.googleusercontent.com/meips/ADKq_NaxItFi-yF2RxRNI9BO8yERSyFYHxb4gaTRO-6U7baJmmh7ApaYhf0IDm_3n56SH2iKpf38KSw6XPJYZh3i8Y07HCM_l0x9IKDaozD9XQFEgXL3izhR3AB-I4sH-Njkoxx8Vy4pitYDiJ8NEV4Fl-5CIwp9oQ=s0-d-e1-ft#https://stripe-images.s3.amazonaws.com/emails/acct_1FYbdJIYtv5oAFkS/2/twelve_degree_icon@2x.png" alt="Stan Logo">
      </div>
    </div>
    <div class="stan-header-spacer"></div>
    <div class="stan-content">
      <div class="receipt-title">Receipt from Stan - Your Creator Store</div>
      <div class="receipt-id">Receipt #{{RECEIPT_ID}}</div>
      <div class="info-row">
        <div class="info-col">
          <div class="info-label">AMOUNT PAID</div>
          <div>{{AMOUNT_PAID}}</div>
        </div>
        <div class="info-col">
          <div class="info-label">DATE PAID</div>
          <div>{{DATE_PAID}}</div>
        </div>
        <div class="info-col">
          <div class="info-label">PAYMENT METHOD</div>
          <div><span style="font-style:italic; color:#f2f2f2;">{{PAYMENT_METHOD}}</span> - {{CARD_LAST4}}</div>
        </div>
      </div>
      <div class="summary-section">
        <div class="summary-title">SUMMARY</div>
        <div class="summary-card">
          <div class="summary-row">
            <span>{{PRODUCT_NAME}} &lt;&gt; {{BUYER_NAME}}</span>
            <span>{{PRODUCT_PRICE}}</span>
          </div>
          <div class="summary-row">
            <span style="font-weight:600;">Amount paid</span>
            <span>{{TOTAL_AMOUNT}}</span>
          </div>
        </div>
      </div>
      <div class="support">
        If you have any questions, visit our support site at
        <a href="https://help.stan.store" target="_blank">https://help.stan.store</a>,
        or contact the creator at <a href="mailto:{{SELLER_EMAIL}}">{{SELLER_EMAIL}}</a>.
      </div>
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