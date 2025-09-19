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

  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    img { -ms-interpolation-mode:bicubic; }
    table { border-collapse: collapse !important; }
  </style>
  <![endif]-->

  <style>
    /* Base reset for email */
    body { margin:0; padding:0; background:#EAEAEA; color:#000000; }
    img { border:0; outline:none; text-decoration:none; display:block; }
    a { color:#2848F0; text-decoration:none; }
    table { border-spacing:0; border-collapse:collapse; }

    /* Container */
    .wrapper { width:100%; background:#EAEAEA; }
    .container { width:100%; max-width:600px; margin:0 auto; }
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
    .btn { background:#2848F0; color:#FFFFFF !important; font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:18px; font-weight:bold; border-radius:8px; padding:12px 18px; display:inline-block; }

    @media screen and (max-width: 500px) {
      .container { width:100% !important; }
      .stack, .stack td, .stack table { display:block !important; width:100% !important; }
      .btn { display:block !important; width:100% !important; text-align:center !important; }
      .px-16 { padding-left:16px !important; padding-right:16px !important; }
    }

    /* Prevent iOS blue link styling */
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
  </style>
</head>

<body>
  <center class="wrapper">
    <table role="presentation" width="100%">
      <tr>
        <td align="center">

          <!-- Outer container -->
          <table role="presentation" class="container" width="100%">

            <!-- Avatar -->
            <tr>
              <td align="center" class="pt-16">
                <a href="{{UNTITLED_URL}}">
                  <img src="{{SELLER_LOGO_URL}}" width="120" alt="{{SELLER_NAME}}'s profile picture" style="width:120px; height:auto; border-radius:1000px;">
                </a>
              </td>
            </tr>

            <!-- Thank you card -->
            <tr>
              <td class="px-16 pb-16">
                <table role="presentation" width="100%" class="card">
                  <tr>
                    <td class="px-16 py-16">
                      <h1>Thanks for your order, {{BUYER_NAME}}! 🙏</h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Product title -->
            <tr>
              <td class="px-16">
                <table role="presentation" width="100%" class="card">
                  <tr>
                    <td class="px-16 py-16">
                      <h2 class="text"><strong>{{PRODUCT_NAME}}</strong></h2>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- URL + Button, fluid two columns -->
            <tr>
              <td class="px-16 pb-16">
                <table role="presentation" width="100%" class="card">
                  <tr>
                    <td class="px-16 py-16">
                      <table role="presentation" width="100%" class="row stack">
                        <tr>
                          <!-- Left text -->
                          <td class="col col-66 text" style="padding-right:12px;">
                            <div>{{UNTITLED_URL}}</div>
                            <div class="muted">url</div>
                          </td>
                          <!-- Right button -->
                          <td class="col col-34" align="right" style="padding-left:12px;">
                            <a href="{{ACCESS_LINK}}" class="btn">Access link</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Order Summary -->
            <tr>
              <td class="px-16">
                <table role="presentation" width="100%" class="card">
                  <tr>
                    <td class="px-16 pt-16">
                      <h2 class="text"><strong>Order Summary</strong></h2>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-16 pb-16 text">
                      <div><strong>Date:</strong> {{ORDER_DATE}}</div>
                      <div><strong>Order #:</strong> {{ORDER_ID}}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Line item, fluid two columns -->
            <tr>
              <td class="px-16 pb-16">
                <table role="presentation" width="100%" class="card">
                  <tr>
                    <td class="px-16 py-16">
                      <table role="presentation" width="100%" class="row stack">
                        <tr>
                          <!-- Product image -->
                          <td class="col col-25" style="padding-right:12px;" align="left">
                            <a href="">
                              <img src="{{PRODUCT_IMAGE_URL}}" width="128" alt="product image" style="width:128px; max-width:100%; height:auto;">
                            </a>
                          </td>
                          <!-- Name and price -->
                          <td class="col col-75 text" style="padding-left:12px;">
                            <div>{{PRODUCT_NAME}}</div>
                            <div class="muted">{{PRODUCT_PRICE}}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Customer portal note -->
                  <tr>
                    <td class="px-16 pb-16 text">
                      Visit the <a href="{{CUSTOMER_PORTAL_URL}}">customer portal</a> to manage your order and access your content any time.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Feedback -->
            <tr>
              <td class="px-16">
                <table role="presentation" width="100%" class="card">
                  <tr>
                    <td class="px-16 pt-16">
                      <h2 class="text">Your feedback matters!</h2>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-16 text">
                      Share your experience and help others with your product review!
                    </td>
                  </tr>

                  <!-- Star row rebuilt with a small table -->
                  <tr>
                    <td class="px-16 pt-16" align="center">
                      <table role="presentation" align="center" cellpadding="0" cellspacing="8">
                        <tr>
                          <td><a href="{{REVIEW_LINK_1}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" alt="★"></a></td>
                          <td><a href="{{REVIEW_LINK_2}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" alt="★"></a></td>
                          <td><a href="{{REVIEW_LINK_3}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" alt="★"></a></td>
                          <td><a href="{{REVIEW_LINK_4}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" alt="★"></a></td>
                          <td><a href="{{REVIEW_LINK_5}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" alt="★"></a></td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Review button -->
                  <tr>
                    <td class="px-16 pb-24" align="center">
                      <a href="{{REVIEW_MAIN_LINK}}" class="btn">Leave a review</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Help -->
            <tr>
              <td class="px-16">
                <table role="presentation" width="100%" class="card">
                  <tr>
                    <td class="px-16 pt-16">
                      <h2 class="text">Need help?</h2>
                    </td>
                  </tr>
                  <tr>
                    <td class="px-16 pb-32 text">
                      If you have any questions or need assistance with your order, feel free to contact {{SELLER_NAME}} directly.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Beacons badge and footer -->
            <tr>
              <td class="px-16 pb-32" align="center">
                <a href="{{UNTITLED_URL}}">
                  <img src="https://cdn.beacons.ai/images/beacons_assets/made-with-beacons.png" alt="made with beacons" style="height:40px; width:auto;">
                </a>

                <div class="text muted" style="padding-top:24px;">
                  You are getting this receipt email because you bought a product from <a style="font-weight:bold; color:#757575;" href="{{UNTITLED_URL}}" target="_blank">{{SELLER_NAME}}</a>.
                  If you would like to stop receiving future marketing messages, <a style="text-decoration:underline; color:#757575;" href="{{CUSTOMER_PORTAL_URL}}" target="_blank">unsubscribe</a> from the list.
                </div>
              </td>
            </tr>

          </table>
          <!-- /container -->

        </td>
      </tr>
    </table>
  </center>

  <!-- Tracking pixel from original (optional) -->
  <img src="https://c.info.beacons.ai/wf/open?upn=u001.ZVVMriL2rBySvNViTnc2wTuxgIaVR7uJ6K3ATBSPALAzF3aMwMZIiz4k7OmdojJSoVO8PViPjKOqK7fjWb5Pncn56oIolM8OXjE4Vs9lT3Yv8DqVTynmv8LagJgsNfFiY3Eo7o5yKFzCn8w-2BFwPw8blmcBuNJmO9pz-2BflXsAjjDDXDZxmX7vYvDwYTkcAg8h-2BegOXe8XNxrQBnCPBrAMDvcWuFvNVqW1vN-2Bbdv7ErxXUccCrCA4QSrM5S2rpJ2LkDIqHse80mOEI7oaqj7FhJ-2BHTJ0GAXan7H1mVKBrnASkCmzYCXSOAbz8TEbY4pI8UYpBLzHFDDB7ZfHIXQTIjTpYTLfO7bIQDo9wzgOljLE1Q-3D" alt="" width="1" height="1" style="display:block; width:1px; height:1px; border:0;">
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