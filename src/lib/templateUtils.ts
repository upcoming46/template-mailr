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
  beacons: `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>Receipt</title>

    <style>
      /* Base reset for email */
      body { margin:0; padding:0; background:#EAEAEA; color:#000000; }
      img { border:0; outline:none; text-decoration:none; display:block; }
      a { color:#2848F0; text-decoration:none; }
      table { border-spacing:0; border-collapse:collapse; }

      /* Container */
      .wrapper { width:100%; background:#EAEAEA; }
      /* IMPORTANT FIX: Force max-width for container on all clients */
      .container { width:100%; max-width:600px; margin:0 auto; }
      /* IMPORTANT FIX: Ensure cards always have a white background */
      .card { background:#FFFFFF; }

      /* Spacing helpers */
      .px-16 { padding-left:16px; padding-right:16px; }
      .py-16 { padding-top:16px; padding-bottom:16px; }
      .pt-16 { padding-top:16px; }
      .pb-16 { padding-bottom:16px; }
      .pb-24 { padding-bottom:24px; }
      .pb-32 { padding-bottom:32px; }

      /* Headings and text */
      h1, h2 { margin:0; font-family: Arial, Helvetica, sans-serif; }
      h1 { font-size:24px; line-height:30px; text-align:center; }
      h2 { font-size:18px; line-height:24px; }
      .text { font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:20px; }
      .muted { color:#757575; }

      /* Columns that stack on mobile */
      .row { width:100%; }
      .col { vertical-align:top; }
      .col-66 { width:66.66%; }
      .col-34 { width:33.33%; }
      .col-75 { width:75%; }
      .col-25 { width:25%; }

      /* Buttons */
      /* Applied inline in the button structure below, but keeping this for reference */
      .btn { background:#2848F0; color:#FFFFFF !important; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:18px; font-weight:bold; border-radius:8px; padding:12px 18px; display:inline-block; }

      @media screen and (max-width: 500px) {
        .container { width:100% !important; }
        /* IMPORTANT FIX: Added max-width to address container issues */
        .stack, .stack td, .stack table { display:block !important; width:100% !important; max-width: 100% !important; }
        .btn { display:block !important; width:100% !important; text-align:center !important; }
        .px-16 { padding-left:16px !important; padding-right:16px !important; }
      }

      /* Prevent iOS blue link styling */
      a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }

      /* Dark Mode Fixes - A common cause of your issue is a dark mode inversion */
      /* Adding some basic dark mode declarations, though a full fix is more complex */
      @media (prefers-color-scheme: dark) {
          .wrapper { background-color: #EAEAEA !important; }
          .card { background-color: #FFFFFF !important; }
          .text, h1, h2 { color: #000000 !important; }
          .muted { color: #757575 !important; }
      }
    </style>
</head>

<body style="margin:0; padding:0; background:#EAEAEA; color:#000000; font-family: Arial, Helvetica, sans-serif;">
    <center class="wrapper" style="width:100%; background:#EAEAEA;">
        <table role="presentation" width="100%" style="border-spacing:0; border-collapse:collapse;">
            <tr>
                <td align="center">

                    <table role="presentation" class="container" width="100%" style="max-width:600px; margin:0 auto; border-spacing:0; border-collapse:collapse;">

                        <tr>
                            <td align="center" class="pt-16" style="padding-top:16px;">
                                <a href="#">
                                    <img src="{{SELLER_LOGO}}" width="120" alt="Seller profile picture" style="width:120px; height:auto; border-radius:1000px; display:block; border:0; outline:none; text-decoration:none;">
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td class="px-16 pb-16" style="padding-left:16px; padding-right:16px; padding-bottom:16px;">
                                <table role="presentation" width="100%" class="card" style="background:#FFFFFF; border-spacing:0; border-collapse:collapse;">
                                    <tr>
                                        <td class="px-16 py-16" style="padding:16px;">
                                            <h1 style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size:24px; line-height:30px; text-align:center; color:#000000;">Thanks for your order, {{BUYER_NAME}}! 🙏</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td class="px-16" style="padding-left:16px; padding-right:16px;">
                                <table role="presentation" width="100%" class="card" style="background:#FFFFFF; border-spacing:0; border-collapse:collapse;">
                                    <tr>
                                        <td class="px-16 py-16" style="padding:16px;">
                                            <h2 class="text" style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size:18px; line-height:24px; color:#000000;"><strong>{{PRODUCT_NAME}}</strong></h2>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td class="px-16 pb-16" style="padding-left:16px; padding-right:16px; padding-bottom:16px;">
                                <table role="presentation" width="100%" class="card" style="background:#FFFFFF; border-spacing:0; border-collapse:collapse;">
                                    <tr>
                                        <td class="px-16 py-16" style="padding:16px;">
                                            <table role="presentation" width="100%" class="row stack" style="border-spacing:0; border-collapse:collapse;">
                                                <tr>
                                                    <td class="col col-66 text" style="padding-right:12px; vertical-align:top; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:20px; color:#000000;">
                                                        <div style="color:#000000;">{{LINK_NAME}}</div>
                                                        <div class="muted" style="color:#757575;">{{LINK_TYPE}}</div>
                                                    </td>
                                                    <td class="col col-34" align="right" style="padding-left:12px; vertical-align:top; width:33.33%;">
                                                        <a href="{{LINK_URL}}"
                                                           class="btn"
                                                           style="background:#2848F0; color:#FFFFFF !important; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:18px; font-weight:bold; border-radius:8px; padding:12px 18px; display:inline-block; text-decoration:none;">Access link</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td class="px-16" style="padding-left:16px; padding-right:16px;">
                                <table role="presentation" width="100%" class="card" style="background:#FFFFFF; border-spacing:0; border-collapse:collapse;">
                                    <tr>
                                        <td class="px-16 pt-16" style="padding-left:16px; padding-right:16px; padding-top:16px;">
                                            <h2 class="text" style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size:18px; line-height:24px; color:#000000;"><strong>Order Summary</strong></h2>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-16 pb-16 text" style="padding-left:16px; padding-right:16px; padding-bottom:16px; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:20px; color:#000000;">
                                            <div style="color:#000000;"><strong>Date:</strong> {{DATE}}</div>
                                            <div style="color:#000000;"><strong>Order #:</strong> {{ORDER_ID}}</div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td class="px-16 pb-16" style="padding-left:16px; padding-right:16px; padding-bottom:16px;">
                                <table role="presentation" width="100%" class="card" style="background:#FFFFFF; border-spacing:0; border-collapse:collapse;">
                                    <tr>
                                        <td class="px-16 py-16" style="padding:16px;">
                                            <table role="presentation" width="100%" class="row stack" style="border-spacing:0; border-collapse:collapse;">
                                                <tr>
                                                    <td class="col col-25" style="padding-right:12px; vertical-align:top; width:25%;" align="left">
                                                        <a href="">
                                                            <img src="{{PRODUCT_IMAGE}}"
                                                                 width="128" alt="product image" style="width:128px; max-width:100%; height:auto; display:block; border:0; outline:none; text-decoration:none;">
                                                        </a>
                                                    </td>
                                                    <td class="col col-75 text" style="padding-left:12px; vertical-align:top; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:20px; color:#000000; width:75%;">
                                                        <div style="color:#000000;">{{PRODUCT_NAME}}</div>
                                                        <div class="muted" style="color:#757575;">{{PRICE}}</div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td class="px-16 pb-16 text" style="padding-left:16px; padding-right:16px; padding-bottom:16px; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:20px; color:#000000;">
                                            Visit the
                                            <a href="{{CUSTOMER_PORTAL_URL}}" style="color:#2848F0; text-decoration:none;">customer portal</a>
                                            to manage your order and access your content any time.
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td class="px-16" style="padding-left:16px; padding-right:16px;">
                                <table role="presentation" width="100%" class="card" style="background:#FFFFFF; border-spacing:0; border-collapse:collapse;">
                                    <tr>
                                        <td class="px-16 pt-16" style="padding-left:16px; padding-right:16px; padding-top:16px;">
                                            <h2 class="text" style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size:18px; line-height:24px; color:#000000;">Your feedback matters!</h2>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-16 text" style="padding-left:16px; padding-right:16px; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:20px; color:#000000;">
                                            Share your experience and help others with your product review!
                                        </td>
                                    </tr>

                                    <tr>
                                        <td class="px-16 pt-16" align="center" style="padding-left:16px; padding-right:16px; padding-top:16px;">
                                            <table role="presentation" align="center" cellpadding="0" cellspacing="8" style="border-spacing:0; border-collapse:collapse;">
                                                <tr>
                                                    <td style="padding:0;"><a href="{{REVIEW_URL}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" alt="★" style="display:block; border:0; outline:none; text-decoration:none;"></a></td>
                                                    <td style="padding:0;"><a href="{{REVIEW_URL}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" alt="★" style="display:block; border:0; outline:none; text-decoration:none;"></a></td>
                                                    <td style="padding:0;"><a href="{{REVIEW_URL}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" alt="★" style="display:block; border:0; outline:none; text-decoration:none;"></a></td>
                                                    <td style="padding:0;"><a href="{{REVIEW_URL}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" alt="★" style="display:block; border:0; outline:none; text-decoration:none;"></a></td>
                                                    <td style="padding:0;"><a href="{{REVIEW_URL}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" alt="★" style="display:block; border:0; outline:none; text-decoration:none;"></a></td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td class="px-16 pb-24" align="center" style="padding-left:16px; padding-right:16px; padding-bottom:24px;">
                                            <a href="{{REVIEW_URL}}"
                                               class="btn"
                                               style="background:#2848F0; color:#FFFFFF !important; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:18px; font-weight:bold; border-radius:8px; padding:12px 18px; display:inline-block; text-decoration:none;">Leave a review</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td class="px-16" style="padding-left:16px; padding-right:16px;">
                                <table role="presentation" width="100%" class="card" style="background:#FFFFFF; border-spacing:0; border-collapse:collapse;">
                                    <tr>
                                        <td class="px-16 pt-16" style="padding-left:16px; padding-right:16px; padding-top:16px;">
                                            <h2 class="text" style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size:18px; line-height:24px; color:#000000;">Need help?</h2>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-16 pb-32 text" style="padding-left:16px; padding-right:16px; padding-bottom:32px; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:20px; color:#000000;">
                                            If you have any questions or need assistance with your order, feel free to contact {{SELLER_NAME}} directly.
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td class="px-16 pb-32" align="center" style="padding-left:16px; padding-right:16px; padding-bottom:32px;">
                                <a href="#">
                                    <img src="https://cdn.beacons.ai/images/beacons_assets/made-with-beacons.png" alt="made with beacons" style="height:40px; width:auto; display:block; border:0; outline:none; text-decoration:none;">
                                </a>

                                <div class="text muted" style="padding-top:24px; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:20px; color:#757575;">
                                    You are getting this receipt email because you bought a product from
                                    <a style="font-weight:bold; color:#757575; text-decoration:none;" href="#" target="_blank">{{SELLER_NAME}}</a>.
                                    If you would like to stop receiving future marketing messages,
                                    <a style="text-decoration:underline; color:#757575;" href="#" target="_blank">unsubscribe</a> from the list.
                                </div>
                            </td>
                        </tr>

                    </table>
                    </td>
            </tr>
        </table>
    </center>

    <img src="https://example.com/tracking.png"
        alt="" width="1" height="1" style="display:block; width:1px; height:1px; border:0;">
</body>
</html>`,

    stanstore: `<div bgcolor="#f6f9fc" style="border:0;margin:0;padding:0;min-width:100%;width:100%">
        
        <table bgcolor="#f6f9fc" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:0;margin:0;padding:0">
          <tbody>
            <tr>
              <td class="m_2435347494993575023st-Spacer m_2435347494993575023st-Spacer--kill m_2435347494993575023st-Spacer--height" height="64">
                <div class="m_2435347494993575023st-Spacer m_2435347494993575023st-Spacer--kill">&nbsp;</div>
              </td>
            </tr>
            
            <tr>
              <td style="border:0;margin:0;padding:0">
                
                <table class="m_2435347494993575023st-Wrapper" align="center" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" width="600" style="border-top-left-radius:16px;border-top-right-radius:16px;margin:0 auto;min-width:600px">
                  <tbody>
                    <tr>
                      <td style="border:0;margin:0;padding:0">
                        
    <table class="m_2435347494993575023st-Width m_2435347494993575023st-Width--mobile" border="0" cellpadding="0" cellspacing="0" width="600" style="min-width:600px">
    <tbody>
      <tr>
        <td align="center" height="0" style="border:0;margin:0;padding:0;color:#ffffff;display:none!important;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">
          <span class="m_2435347494993575023st-Delink m_2435347494993575023st-Delink--preheader" style="color:#ffffff;text-decoration:none">
            
      Receipt from Stan - Your Creator Store [#{{RECEIPT_ID}}] Amount paid {{AMOUNT_PAID}} Date paid {{DATE_PAID}}  
            
             ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏  ͏ 
             ͏  ͏  ͏  ͏  ͏  ͏ 
            ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ 
            ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ 
            ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ 
            ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ 
            ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ ­ 
            &nbsp; 
           </span>
        </td>
      </tr>
    </tbody>
  </table>
    
    <div style="background-color:#f6f9fc;padding-top:20px">
      <table dir="ltr" width="100%" style="border:0;border-collapse:collapse;margin:0;padding:0;background-color:#ffffff">
        <tbody>
        <tr>
          <td style="background-color:#ffffff;border:0;border-collapse:collapse;margin:0;padding:0;font-size:0;line-height:0px;background-size:100% 100%;border-top-left-radius:5px" align="right" height="156" valign="bottom" width="252">
              <a href="https://stan.store/" style="outline:0;text-decoration:none" target="_blank">
                <img alt="" height="156" width="252" src="https://stripe-images.stripecdn.com/notifications/hosted/20180110/Header/Left.png" style="display:block;border:0;line-height:100%;width:100%">
              </a>
          </td>
          <td style="background-color:#ffffff;border:0;border-collapse:collapse;margin:0;padding:0;font-size:0;line-height:0px;background-size:100% 100%;width:96px!important" align="center" height="156" valign="bottom">
            <a href="https://stan.store/" style="outline:0;text-decoration:none" target="_blank">
              <img alt="" height="156" width="96" src="https://stripe-images.s3.amazonaws.com/emails/acct_1FYbdJIYtv5oAFkS/2/twelve_degree_icon@2x.png" style="display:block;border:0;line-height:100%">
            </a>
          </td>
          <td style="background-color:#ffffff;border:0;border-collapse:collapse;margin:0;padding:0;font-size:0;line-height:0px;background-size:100% 100%;border-top-right-radius:5px" align="left" height="156" valign="bottom" width="252">
              <a href="https://stan.store/" style="outline:0;text-decoration:none" target="_blank">
                <img alt="" height="156" width="252" src="https://stripe-images.stripecdn.com/notifications/hosted/20180110/Header/Right.png" style="display:block;border:0;line-height:100%;width:100%">
              </a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <table class="m_2435347494993575023st-Width m_2435347494993575023st-Width--mobile" border="0" cellpadding="0" cellspacing="0" width="600" style="min-width:600px">
      <tbody>
        <tr>
          <td align="center" style="border:0;border-collapse:collapse;margin:0;padding:0;width:472px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#32325d;font-size:24px;line-height:32px">
              Receipt from Stan - Your Creator Store
          </td>
        </tr>
        <tr>
          <td class="m_2435347494993575023st-Spacer" colspan="3" height="12" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px">
            <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <table class="m_2435347494993575023st-Width m_2435347494993575023st-Width--mobile" border="0" cellpadding="0" cellspacing="0" width="600" style="min-width:600px">
      <tbody>
        <tr>
          <td align="center" style="border:0;border-collapse:collapse;margin:0;padding:0;width:472px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#8898aa;font-size:15px;line-height:18px">
            Receipt #{{RECEIPT_ID}}
          </td>
        </tr>
        <tr>
          <td class="m_2435347494993575023st-Spacer" colspan="3" height="12" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px">
            <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
          </td>
        </tr>
      </tbody>
    </table>
      <table class="m_2435347494993575023st-Spacer m_2435347494993575023st-Width m_2435347494993575023st-Width--mobile" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td height="20" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;max-height:1px">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
    </tbody>
  </table>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td class="m_2435347494993575023st-Font m_2435347494993575023st-Font--caption" style="border:0;margin:0;padding:0;color:#687385;font-family:-apple-system,'SF Pro Display','SF Pro Text','Helvetica',sans-serif;font-size:12px;font-weight:bold;line-height:16px;text-transform:uppercase">
        
      </td> <td width="64" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
      <td valign="top" style="border:0;border-collapse:collapse;margin:0;padding:0">
      <table style="border:0;border-collapse:collapse;margin:0;padding:0">
        <tbody>
        <tr>
          <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#8898aa;font-size:12px;line-height:16px;white-space:nowrap;font-weight:bold;text-transform:uppercase">
            Amount paid
          </td>
        </tr>
        <tr>
          <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;white-space:nowrap">
           
         {{AMOUNT_PAID}}    
          
          </td>
        </tr>
        </tbody>
      </table>
    </td>
      <td width="20" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
      <td valign="top" style="border:0;border-collapse:collapse;margin:0;padding:0">
      <table style="border:0;border-collapse:collapse;margin:0;padding:0">
        <tbody>
        <tr>
          <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#8898aa;font-size:12px;line-height:16px;white-space:nowrap;font-weight:bold;text-transform:uppercase">
            Date paid
          </td>
        </tr>
        <tr>
          <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;white-space:nowrap">{{DATE_PAID}}    
          
          </td>
        </tr>
        </tbody>
      </table>
    </td>
      <td width="20" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
        <td valign="top" style="border:0;border-collapse:collapse;margin:0;padding:0">
      <table style="border:0;border-collapse:collapse;margin:0;padding:0">
        <tbody>
        <tr>
          <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#8898aa;font-size:12px;line-height:16px;white-space:nowrap;font-weight:bold;text-transform:uppercase">
            Payment method
          </td>
        </tr>
        <tr>
          <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;white-space:nowrap">
           
          <span>      <img alt="{{PAYMENT_METHOD}}" height="16" src="https://stripe-images.stripecdn.com/emails/receipt_assets/card/mastercard-dark@2x.png" style="border:0;margin:0;padding:0;vertical-align:text-bottom" width="75">    </span>    <span>      - {{CARD_LAST4}}</span></td>
        </tr>
        </tbody>
      </table>
    </td>
      <td width="64" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
   
        
      </tr>
    </tbody>
  </table>
    
    <table class="m_2435347494993575023st-Spacer m_2435347494993575023st-Width m_2435347494993575023st-Width--mobile" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td height="32" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;max-height:1px">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
    </tbody>
  </table>
    
    <table class="m_2435347494993575023st-Width m_2435347494993575023st-Width--mobile" border="0" cellpadding="0" cellspacing="0" width="600" style="min-width:600px">
    <tbody>
      <tr>
        <td class="m_2435347494993575023st-Spacer" colspan="3" height="8" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
      <tr>
        <td class="m_2435347494993575023st-Spacer m_2435347494993575023st-Spacer--gutter" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px" width="48">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
        <td class="m_2435347494993575023st-Font m_2435347494993575023st-Font--caption" style="border:0;margin:0;padding:0;color:#687385;font-family:-apple-system,'SF Pro Display','SF Pro Text','Helvetica',sans-serif;font-weight:400;font-size:12px;line-height:16px;text-transform:uppercase">
        
        <span class="m_2435347494993575023st-Delink" style="border:0;margin:0;padding:0;font-weight:bold">
          Summary
        </span>    
         
         </td>
        <td class="m_2435347494993575023st-Spacer m_2435347494993575023st-Spacer--gutter" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px" width="48">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
      <tr>
        <td class="m_2435347494993575023st-Spacer" colspan="3" height="8" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
    </tbody>
  </table>
    <table class="m_2435347494993575023st-Blocks m_2435347494993575023st-Width m_2435347494993575023st-Width--mobile" border="0" cellpadding="0" cellspacing="0" width="600" style="min-width:600px">
    <tbody>
      <tr>
        <td class="m_2435347494993575023st-Spacer" colspan="3" height="24" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
      <tr>
        <td class="m_2435347494993575023st-Spacer m_2435347494993575023st-Spacer--kill" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px" width="48">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
        <td style="border:0;margin:0;padding:0">
          <table class="m_2435347494993575023st-Blocks-inner" bgcolor="#f6f9fc" border="0" cellpadding="0" cellspacing="0" style="border-radius:8px" width="100%">
            <tbody>
             
    <tr>
    <td style="border:0;margin:0;padding:0">
      <table class="m_2435347494993575023st-Blocks-item" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tbody>
          <tr>
            <td class="m_2435347494993575023st-Spacer" colspan="3" height="12" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px">
              <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td class="m_2435347494993575023st-Spacer m_2435347494993575023st-Spacer--gutter" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px" width="16">
              <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
            </td>
            <td class="m_2435347494993575023st-Blocks-item-cell m_2435347494993575023st-Font m_2435347494993575023st-Font--body" style="border:0;margin:0;padding:0;color:#414552;font-family:-apple-system,'SF Pro Display','SF Pro Text','Helvetica',sans-serif;font-size:16px;line-height:24px">
              
      <table style="padding-left:5px;padding-right:5px" width="100%">
      <tbody><tr>
        <td>
         
       
          </td> </tr> <tr>
      <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;width:100%">
          {{PRODUCT_NAME}} &lt;&gt;&nbsp;{{BUYER_NAME}}</td>
      <td width="8" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
      <td align="right" valign="top" style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px">
            {{PRODUCT_PRICE}}
      </td>
    </tr>
      <tr>
        <td colspan="3" height="6" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
      </tr>
      <tr>
        <td colspan="3" height="6" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
    </tr>
     
    <tr>
      <td bgcolor="e6ebf1" colspan="3" height="1" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
    </tr>
     
    <tr>
      <td colspan="3" height="8" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
    </tr>
         
    <tr>
      <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;width:100%">
          <strong>Amount paid</strong>
      </td>
      <td width="8" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
      <td align="right" valign="top" style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px">
            <strong>{{TOTAL_AMOUNT}}</strong>
      </td>
    </tr>
      <tr>
        <td colspan="3" height="6" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td>
      </tr>
      
       
       
       
      
    </tbody></table> 
  
             </td>
            <td class="m_2435347494993575023st-Spacer m_2435347494993575023st-Spacer--gutter" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px" width="16">
              <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td class="m_2435347494993575023st-Spacer" colspan="3" height="12" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px">
              <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
            </td>
          </tr>
        </tbody>
      </table>
    </td> </tr>
             </tbody>
          </table>
        </td>
        <td class="m_2435347494993575023st-Spacer m_2435347494993575023st-Spacer--kill" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px" width="48">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
      <tr>
        <td class="m_2435347494993575023st-Spacer" colspan="3" height="24" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
    </tbody>
  </table>
     
    <table class="m_2435347494993575023st-Width m_2435347494993575023st-Width--mobile" border="0" cellpadding="0" cellspacing="0" width="600" style="min-width:600px">
    <tbody>
      <tr>
        <td class="m_2435347494993575023st-Spacer" colspan="3" height="8" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
      <tr>
        <td class="m_2435347494993575023st-Spacer m_2435347494993575023st-Spacer--gutter" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px" width="48">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
        <td style="border:0;margin:0;padding:0;color:#414552!important;font-family:-apple-system,'SF Pro Display','SF Pro Text','Helvetica',sans-serif;font-weight:400;font-size:16px;line-height:24px">
         If you have any questions, visit our support site at <a style="border:0;margin:0;padding:0;color:#625afa!important;font-weight:bold;text-decoration:none" href="https://help.stan.store" target="_blank">http://help.stan.store</a>,
or contact the creator at <a href="mailto:{{SELLER_EMAIL}}">{{SELLER_EMAIL}}</a>.
         </td>
        <td class="m_2435347494993575023st-Spacer m_2435347494993575023st-Spacer--gutter" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px" width="48">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
      <tr>
        <td class="m_2435347494993575023st-Spacer" colspan="3" height="8" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px">
          <div class="m_2435347494993575023st-Spacer">&nbsp;</div>
        </td>
      </tr>
    </tbody>
  </table>
   
   
  <table width="100%" style="border:0;border-collapse:collapse;margin:0;padding:0;background-color:#ffffff"><tbody><tr><td height="20" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td></tr></tbody></table>
    <table width="100%" style="border:0;border-collapse:collapse;margin:0;padding:0;background-color:#ffffff"><tbody><tr><td height="20" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td></tr></tbody></table>
    <table width="100%" style="border:0;border-collapse:collapse;margin:0;padding:0;background-color:#ffffff;border-bottom-left-radius:5px;border-bottom-right-radius:5px"><tbody><tr><td height="64" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px">&nbsp;</td></tr></tbody></table>
                      </td>
                    </tr>
                    </tbody>
                </table>
                
              </td>
            </tr>
          </tbody>
        </table>
        
  </div>`,

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