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
  beacons: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light only" />
      <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    </head>
    <body style="margin: 0; padding: 0; font-family: arial, helvetica, sans-serif; font-size: 14px; color: #000000; background-color: #EAEAEA;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: #EAEAEA; margin: 0; padding: 0;">
        <tr>
          <td align="center" valign="top" width="100%" style="padding: 0; background-color: #EAEAEA;">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 600px; margin: 0 auto; background-color: #EAEAEA;">
              <tr>
                <td width="600" style="padding: 16px; background-color: #EAEAEA;">
                  
                  <!-- Profile Image -->
                  <table cellpadding="0" cellspacing="0" border="0" width="568" style="margin: 0 0 16px 0; width: 568px;">
                    <tr>
                      <td align="center" width="568" style="padding: 0;">
                        <a href="{{UNTITLED_URL}}" style="text-decoration: none;">
                          <img src="{{SELLER_LOGO_URL}}" alt="{{SELLER_NAME}}'s profile picture" width="142" height="142" style="display: block; max-width: 142px; width: 142px; height: 142px; border-radius: 50%; border: 0;" />
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Thank You Message -->
                  <table cellpadding="0" cellspacing="0" border="0" width="568" style="background-color: #ffffff; margin: 0 0 16px 0; border-radius: 8px; width: 568px;">
                    <tr>
                      <td width="568" style="padding: 16px;">
                        <h1 style="text-align: center; margin: 0; padding: 0; font-family: arial, helvetica, sans-serif; font-size: 28px; font-weight: bold; color: #000000;">Thanks for your order, {{BUYER_NAME}}! &#128591;</h1>
                      </td>
                    </tr>
                  </table>

                  <!-- Product Name -->
                  <table cellpadding="0" cellspacing="0" border="0" width="568" style="background-color: #ffffff; margin: 0 0 0 0; border-radius: 8px 8px 0 0; width: 568px;">
                    <tr>
                      <td width="568" style="padding: 16px 16px 8px 16px;">
                        <h2 style="margin: 0; padding: 0; font-family: arial, helvetica, sans-serif; font-size: 18px; font-weight: 700; color: #000000;">{{PRODUCT_NAME}}</h2>
                      </td>
                    </tr>
                  </table>

                  <!-- Untitled URL & Access Link -->
                  <table cellpadding="0" cellspacing="0" border="0" width="568" style="background-color: #ffffff; margin: 0; width: 568px;">
                    <tr>
                      <td width="568" style="padding: 8px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="536" style="width: 536px;">
                          <tr>
                            <td width="322" style="padding: 0; vertical-align: middle;">
                              <div style="font-family: helvetica, sans-serif; font-size: 12px; font-weight: 400; color: #cc0000; margin: 0 0 2px 0;">Untitled URL</div>
                              <div style="font-family: helvetica, sans-serif; font-size: 12px; color: #000000; margin: 0;">{{UNTITLED_URL}}</div>
                            </td>
                            <td align="right" width="214" style="padding: 0; vertical-align: middle;">
                              <a href="{{ACCESS_LINK}}" style="background-color: #2848F0; border: 0; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 14px; font-weight: normal; font-family: helvetica, sans-serif; text-align: center; text-decoration: none; padding: 12px 18px; mso-padding-alt: 0; min-width: 110px;">
                                <!--[if mso]><i style="letter-spacing: 27px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
                                <span style="mso-text-raise:15pt;">Access link</span>
                                <!--[if mso]><i style="letter-spacing: 27px;mso-font-width:-100%">&nbsp;</i><![endif]-->
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Order Summary -->
                  <table cellpadding="0" cellspacing="0" border="0" width="568" style="background-color: #ffffff; margin: 16px 0 0 0; width: 568px;">
                    <tr>
                      <td width="568" style="padding: 16px 16px 8px 16px;">
                        <h2 style="margin: 0 0 8px 0; padding: 0; font-family: arial, helvetica, sans-serif; font-size: 18px; font-weight: 700; color: #000000;">Order Summary</h2>
                        <div style="font-family: arial, helvetica, sans-serif; font-size: 14px; line-height: 20px; color: #000000; margin: 0 0 4px 0;"><strong>Date: </strong>{{DATE}}</div>
                        <div style="font-family: arial, helvetica, sans-serif; font-size: 14px; line-height: 20px; color: #000000; margin: 0 0 12px 0;"><strong>Order #: </strong>{{ORDER_ID}}</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Product Image & Details -->
                  <table cellpadding="0" cellspacing="0" border="0" width="568" style="background-color: #ffffff; margin: 0; width: 568px;">
                    <tr>
                      <td width="568" style="padding: 8px 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="536" style="width: 536px;">
                          <tr>
                            <td width="100" style="padding: 0; vertical-align: middle;">
                              <img src="{{PRODUCT_IMAGE_URL}}" alt="product image" width="100" height="100" style="display: block; max-width: 100px; width: 100px; height: 100px; border: 0;" />
                            </td>
                            <td width="420" style="padding: 0 0 0 16px; vertical-align: middle;">
                              <div style="font-family: arial, helvetica, sans-serif; font-size: 14px; font-weight: 400; color: #000000; margin: 0 0 2px 0;">{{PRODUCT_NAME}}</div>
                              <div style="font-family: helvetica, sans-serif; font-size: 14px; color: #000000; margin: 0;">{{PRICE}}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Customer Portal Link -->
                  <table cellpadding="0" cellspacing="0" border="0" width="568" style="background-color: #ffffff; margin: 0 0 16px 0; width: 568px;">
                    <tr>
                      <td width="568" style="padding: 8px 16px 16px 16px;">
                        <div style="font-family: arial, helvetica, sans-serif; font-size: 14px; line-height: 18px; color: #000000; margin: 0;">Visit the <a href="{{CUSTOMER_PORTAL_URL}}" style="color: #2848F0; text-decoration: none;">customer portal</a> to manage your order and access your content any time.</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Your Feedback Matters -->
                  <table cellpadding="0" cellspacing="0" border="0" width="568" style="background-color: #ffffff; margin: 0 0 16px 0; width: 568px;">
                    <tr>
                      <td width="568" style="padding: 16px;">
                        <h2 style="margin: 0 0 8px 0; padding: 0; font-family: arial, helvetica, sans-serif; font-size: 18px; font-weight: 700; color: #000000;">Your feedback matters!</h2>
                        <div style="font-family: arial, helvetica, sans-serif; font-size: 14px; line-height: 22px; color: #000000; margin: 0 0 10px 0;">Share your experience and help others with your product review!</div>
                        
                        <!-- Star Rating Images -->
                        <table cellpadding="0" cellspacing="0" border="0" width="536" align="center" style="margin: 10px 0; width: 536px;">
                          <tr>
                            <td align="center" width="536" style="text-align: center;">
                              <a href="{{ACCESS_LINK}}" style="text-decoration: none; display: inline-block; margin: 0 6px;"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" style="height: 32px; width: 32px; display: inline-block; border: 0;" alt="star" /></a><a href="{{ACCESS_LINK}}" style="text-decoration: none; display: inline-block; margin: 0 6px;"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" style="height: 32px; width: 32px; display: inline-block; border: 0;" alt="star" /></a><a href="{{ACCESS_LINK}}" style="text-decoration: none; display: inline-block; margin: 0 6px;"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" style="height: 32px; width: 32px; display: inline-block; border: 0;" alt="star" /></a><a href="{{ACCESS_LINK}}" style="text-decoration: none; display: inline-block; margin: 0 6px;"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" style="height: 32px; width: 32px; display: inline-block; border: 0;" alt="star" /></a><a href="{{ACCESS_LINK}}" style="text-decoration: none; display: inline-block; margin: 0 6px;"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" width="32" height="32" style="height: 32px; width: 32px; display: inline-block; border: 0;" alt="star" /></a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Leave Review Button -->
                        <table cellpadding="0" cellspacing="0" border="0" width="536" align="center" style="margin: 8px 0 0 0; width: 536px;">
                          <tr>
                            <td align="center" width="536" style="text-align: center;">
                              <a href="{{ACCESS_LINK}}" style="background-color: #2848F0; border: 0; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 14px; font-weight: normal; font-family: helvetica, sans-serif; text-align: center; text-decoration: none; padding: 12px 18px; mso-padding-alt: 0; min-width: 110px;">
                                <!--[if mso]><i style="letter-spacing: 27px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
                                <span style="mso-text-raise:15pt;">Leave a review</span>
                                <!--[if mso]><i style="letter-spacing: 27px;mso-font-width:-100%">&nbsp;</i><![endif]-->
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Need Help Section -->
                  <table cellpadding="0" cellspacing="0" border="0" width="568" style="background-color: #ffffff; margin: 0 0 32px 0; border-radius: 0 0 8px 8px; width: 568px;">
                    <tr>
                      <td width="568" style="padding: 16px;">
                        <h2 style="margin: 0 0 8px 0; padding: 0; font-family: arial, helvetica, sans-serif; font-size: 18px; font-weight: 700; color: #000000;">Need help?</h2>
                        <div style="font-family: arial, helvetica, sans-serif; font-size: 14px; line-height: 18px; color: #000000; margin: 0;">If you have any questions or need assistance with your order, feel free to contact {{SELLER_NAME}} directly.</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Footer - Made with Beacons -->
                  <table cellpadding="0" cellspacing="0" border="0" width="568" style="margin: 0; width: 568px;">
                    <tr>
                      <td align="center" width="568" style="padding: 0;">
                        <a href="{{UNTITLED_URL}}" style="text-decoration: none;">
                          <img src="https://cdn.beacons.ai/images/beacons_assets/made-with-beacons.png" alt="made with beacons" width="160" height="40" style="display: block; height: 40px; width: 160px; border: 0; margin: 0 auto 24px auto;" />
                        </a>
                        <div style="color: #757575; font-size: 12px; font-family: arial, helvetica, sans-serif; text-align: center; padding: 0 16px; line-height: 18px;">
                          You are getting this receipt email because you bought a product from <a style="color: #757575; font-weight: bold; text-decoration: none;" href="{{UNTITLED_URL}}">{{SELLER_NAME}}</a>.
                          If you'd like to stop receiving future marketing messages, please <a style="color: #757575; text-decoration: underline;" href="{{CUSTOMER_PORTAL_URL}}">unsubscribe</a> from the list.
                        </div>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <img src="https://c.info.beacons.ai/wf/open?upn=tracking" alt="" width="1" height="1" border="0" style="height: 1px; width: 1px; border: 0; margin: 0; padding: 0;" />
    </body>
</html>`,

    stanstore: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Receipt from Stan</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;">
  <table bgcolor="#f6f9fc" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:0;margin:0;padding:0;background-color:#f6f9fc;">
    <tbody>
      <tr>
        <td style="border:0;margin:0;padding:0;" height="64">
          &nbsp;
        </td>
      </tr>
      <tr>
        <td style="border:0;margin:0;padding:0;">
          <table align="center" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" width="600" style="border-top-left-radius:16px;border-top-right-radius:16px;margin:0 auto;max-width:600px;width:100%;">
            <tbody>
              <tr>
                <td style="border:0;margin:0;padding:0;">
                  <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
                    <tbody>
                      <tr>
                        <td align="center" height="0" style="border:0;margin:0;padding:0;color:#ffffff;display:none!important;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
                          <span style="color:#ffffff;text-decoration:none;">Receipt for {{PRODUCT_NAME}} - Order #{{RECEIPT_ID}} - {{AMOUNT_PAID}} paid on {{DATE_PAID}}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div style="background-color:#f6f9fc;padding-top:20px;">
                    <table dir="ltr" width="100%" style="border:0;border-collapse:collapse;margin:0;padding:0;background-color:#ffffff;">
                      <tbody>
                        <tr>
                          <td style="background-color:#ffffff;border:0;border-collapse:collapse;margin:0;padding:0;font-size:0;line-height:0px;background-size:100% 100%;border-top-left-radius:5px;" align="right" height="156" valign="bottom" width="252">
                            <a href="https://stan.store/" style="outline:0;text-decoration:none;" target="_blank">
                              <img alt="" height="156" width="252" src="https://stripe-images.stripecdn.com/notifications/hosted/20180110/Header/Left.png" style="display:block;border:0;line-height:100%;width:100%;" />
                            </a>
                          </td>
                          <td style="background-color:#ffffff;border:0;border-collapse:collapse;margin:0;padding:0;font-size:0;line-height:0px;background-size:100% 100%;width:96px!important;" align="center" height="156" valign="bottom">
                            <a href="https://stan.store/" style="outline:0;text-decoration:none;" target="_blank">
                              <img alt="" height="156" width="96" src="https://stripe-images.s3.amazonaws.com/emails/acct_1FYbdJIYtv5oAFkS/2/twelve_degree_icon@2x.png" style="display:block;border:0;line-height:100%;" />
                            </a>
                          </td>
                          <td style="background-color:#ffffff;border:0;border-collapse:collapse;margin:0;padding:0;font-size:0;line-height:0px;background-size:100% 100%;border-top-right-radius:5px;" align="left" height="156" valign="bottom" width="252">
                            <a href="https://stan.store/" style="outline:0;text-decoration:none;" target="_blank">
                              <img alt="" height="156" width="252" src="https://stripe-images.stripecdn.com/notifications/hosted/20180110/Header/Right.png" style="display:block;border:0;line-height:100%;width:100%;" />
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
                    <tbody>
                      <tr>
                        <td align="center" style="border:0;border-collapse:collapse;margin:0;padding:20px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#32325d;font-size:24px;line-height:32px;">
                          Receipt from Stan - Your Creator Store
                        </td>
                      </tr>
                      <tr>
                        <td height="12" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                          &nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
                    <tbody>
                      <tr>
                        <td align="center" style="border:0;border-collapse:collapse;margin:0;padding:0 64px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#8898aa;font-size:15px;line-height:18px;">
                          Receipt #{{RECEIPT_ID}}
                        </td>
                      </tr>
                      <tr>
                        <td height="20" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                          &nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:0 64px;">
                    <tbody>
                      <tr>
                        <td style="border:0;margin:0;padding:0;color:#687385;font-family:-apple-system,'SF Pro Display','SF Pro Text','Helvetica',sans-serif;font-size:12px;font-weight:bold;line-height:16px;text-transform:uppercase;">
                        </td>
                        <td width="64" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                        <td valign="top" style="border:0;border-collapse:collapse;margin:0;padding:0;">
                          <table style="border:0;border-collapse:collapse;margin:0;padding:0;">
                            <tbody>
                              <tr>
                                <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#8898aa;font-size:12px;line-height:16px;white-space:nowrap;font-weight:bold;text-transform:uppercase;">
                                  Amount paid
                                </td>
                              </tr>
                              <tr>
                                <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;white-space:nowrap;">
                                  {{AMOUNT_PAID}}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td width="20" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                        <td valign="top" style="border:0;border-collapse:collapse;margin:0;padding:0;">
                          <table style="border:0;border-collapse:collapse;margin:0;padding:0;">
                            <tbody>
                              <tr>
                                <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#8898aa;font-size:12px;line-height:16px;white-space:nowrap;font-weight:bold;text-transform:uppercase;">
                                  Date paid
                                </td>
                              </tr>
                              <tr>
                                <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;white-space:nowrap;">
                                  {{DATE_PAID}}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td width="20" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                        <td valign="top" style="border:0;border-collapse:collapse;margin:0;padding:0;">
                          <table style="border:0;border-collapse:collapse;margin:0;padding:0;">
                            <tbody>
                              <tr>
                                <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#8898aa;font-size:12px;line-height:16px;white-space:nowrap;font-weight:bold;text-transform:uppercase;">
                                  Payment method
                                </td>
                              </tr>
                              <tr>
                                <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;white-space:nowrap;">
                                  <span><img alt="{{PAYMENT_METHOD}}" height="16" src="https://stripe-images.stripecdn.com/emails/receipt_assets/card/mastercard-dark@2x.png" style="border:0;margin:0;padding:0;vertical-align:text-bottom;" width="75" /></span>
                                  <span> - {{CARD_LAST4}}</span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td width="64" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tbody>
                      <tr>
                        <td height="32" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                          &nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
                    <tbody>
                      <tr>
                        <td height="8" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                          &nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;" width="48">
                          &nbsp;
                        </td>
                        <td style="border:0;margin:0;padding:0;color:#687385;font-family:-apple-system,'SF Pro Display','SF Pro Text','Helvetica',sans-serif;font-weight:bold;font-size:12px;line-height:16px;text-transform:uppercase;">
                          SUMMARY
                        </td>
                        <td style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;" width="48">
                          &nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td height="8" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                          &nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
                    <tbody>
                      <tr>
                        <td height="24" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                          &nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;" width="48">
                          &nbsp;
                        </td>
                        <td style="border:0;margin:0;padding:0;">
                          <table bgcolor="#f6f9fc" border="0" cellpadding="0" cellspacing="0" style="border-radius:8px;background-color:#f6f9fc;" width="100%">
                            <tbody>
                              <tr>
                                <td style="border:0;margin:0;padding:0;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tbody>
                                      <tr>
                                        <td height="12" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                                          &nbsp;
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;" width="16">
                                          &nbsp;
                                        </td>
                                        <td style="border:0;margin:0;padding:0;color:#414552;font-family:-apple-system,'SF Pro Display','SF Pro Text','Helvetica',sans-serif;font-size:16px;line-height:24px;">
                                          <table style="padding-left:5px;padding-right:5px;" width="100%">
                                            <tbody>
                                              <tr>
                                                <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;width:100%;">
                                                  {{PRODUCT_NAME}} &lt;&gt; {{BUYER_NAME}}
                                                </td>
                                                <td width="8" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                                                <td align="right" valign="top" style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;">
                                                  {{PRODUCT_PRICE}}
                                                </td>
                                              </tr>
                                              <tr>
                                                <td colspan="3" height="6" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                                              </tr>
                                              <tr>
                                                <td colspan="3" height="6" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                                              </tr>
                                              <tr>
                                                <td bgcolor="#e6ebf1" colspan="3" height="1" style="border:0;border-collapse:collapse;margin:0;padding:0;background-color:#e6ebf1;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                                              </tr>
                                              <tr>
                                                <td colspan="3" height="8" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                                              </tr>
                                              <tr>
                                                <td style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;width:100%;">
                                                  <strong>Amount paid</strong>
                                                </td>
                                                <td width="8" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                                                <td align="right" valign="top" style="border:0;border-collapse:collapse;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;vertical-align:middle;color:#525f7f;font-size:15px;line-height:24px;">
                                                  <strong>{{TOTAL_AMOUNT}}</strong>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td colspan="3" height="6" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                        <td style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;" width="16">
                                          &nbsp;
                                        </td>
                                      </tr>
                                      <tr>
                                        <td height="12" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                                          &nbsp;
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;" width="48">
                          &nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td height="24" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                          &nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
                    <tbody>
                      <tr>
                        <td height="8" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                          &nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;" width="48">
                          &nbsp;
                        </td>
                        <td style="border:0;margin:0;padding:0;color:#414552;font-family:-apple-system,'SF Pro Display','SF Pro Text','Helvetica',sans-serif;font-weight:400;font-size:16px;line-height:24px;">
                          If you have any questions, visit our support site at <a style="border:0;margin:0;padding:0;color:#625afa;font-weight:bold;text-decoration:none;" href="https://help.stan.store" target="_blank">http://help.stan.store</a>, or contact the creator at <a href="mailto:{{SELLER_EMAIL}}" style="color:#625afa;text-decoration:none;">{{SELLER_EMAIL}}</a>.
                        </td>
                        <td style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;" width="48">
                          &nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td height="8" style="border:0;margin:0;padding:0;font-size:1px;line-height:1px;">
                          &nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <table width="100%" style="border:0;border-collapse:collapse;margin:0;padding:0;background-color:#ffffff;">
                    <tbody>
                      <tr>
                        <td height="20" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  <table width="100%" style="border:0;border-collapse:collapse;margin:0;padding:0;background-color:#ffffff;">
                    <tbody>
                      <tr>
                        <td height="20" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  <table width="100%" style="border:0;border-collapse:collapse;margin:0;padding:0;background-color:#ffffff;border-bottom-left-radius:5px;border-bottom-right-radius:5px;">
                    <tbody>
                      <tr>
                        <td height="64" style="border:0;border-collapse:collapse;margin:0;padding:0;color:#ffffff;font-size:1px;line-height:1px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td style="border:0;margin:0;padding:0;" height="64">
          &nbsp;
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`,

    fanbasis: `<div style="font-family:Arial,sans-serif;width:100%;padding:0;margin:0">
    <div style="background-color:#333333">
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-spacing:0px;padding:0;margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#333333">
            <tbody>
                <tr style="border-collapse:collapse">
                    <td valign="top" style="padding:0;margin:0">
                        <table cellspacing="0" cellpadding="0" align="center" style="border-collapse:collapse;border-spacing:0px;table-layout:fixed!important;width:100%">
                            <tbody>
                                <tr style="border-collapse:collapse">
                                    <td align="center" style="padding:0;margin:0">
                                        <table cellspacing="0" cellpadding="0" align="center" bgcolor="#020202" style="border-collapse:collapse;border-spacing:0px;background-color:#020202;width:600px">
                                            <tbody>
                                                <tr style="border-collapse:collapse">
                                                    <td style="margin:0;padding-top:20px;padding-left:30px;padding-right:30px;padding-bottom:40px;background-color:#fefef2" bgcolor="#fefef2" align="left">
                                                        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-spacing:0px">
                                                            <tbody>
                                                                <tr style="border-collapse:collapse">
                                                                    <td valign="top" align="center" style="padding:0;margin:0;width:540px">
                                                                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                                                                            <tbody>
                                                                                <tr style="border-collapse:collapse">
                                                                                    <td align="center" style="padding:0;margin:0;padding-top:15px;padding-bottom:15px">
                                                                                        <h2 style="margin:0;line-height:36px;font-family:Arial,sans-serif;font-size:30px;font-style:normal;font-weight:normal;color:#242424">
                                                                                            <strong>Payment Confirmation</strong>
                                                                                        </h2>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr style="border-collapse:collapse">
                                                                                    <td style="padding:0;margin:0;padding-left:10px">
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:21px;color:#242424;font-size:14px">
                                                                                            Thank you for purchasing <strong>{{PRODUCT_NAME}}</strong> from <strong>{{SELLER_NAME}}</strong>. Your purchase is confirmed, and we're excited to have you on board.
                                                                                        </p>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr style="border-collapse:collapse">
                                                    <td style="margin:0;padding-left:10px;padding-right:10px;padding-top:15px;padding-bottom:20px;background-color:#1e1e1e" bgcolor="#1e1e1e" align="left">
                                                        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-spacing:0px">
                                                            <tbody>
                                                                <tr style="border-collapse:collapse">
                                                                    <td valign="top" align="center" style="padding:0;margin:0;width:580px">
                                                                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                                                                            <tbody>
                                                                                <tr style="border-collapse:collapse">
                                                                                    <td align="center" style="padding:0;margin:0;padding-top:20px">
                                                                                        <h2 style="margin:0;line-height:29px;font-family:Arial,sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#ffffff">
                                                                                            Order summary
                                                                                        </h2>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr style="border-collapse:collapse">
                                                    <td style="margin:0;padding-bottom:5px;padding-top:15px;padding-left:20px;padding-right:20px;background-color:#1e1e1e" bgcolor="#1e1e1e" align="left">
                                                        <table cellspacing="0" cellpadding="0" align="left" style="border-collapse:collapse;border-spacing:0px;float:left">
                                                            <tbody>
                                                                <tr style="border-collapse:collapse">
                                                                    <td align="left" style="padding:0;margin:0;width:272px">
                                                                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                                                                            <tbody>
                                                                                <tr style="border-collapse:collapse">
                                                                                    <td align="left" style="padding:0;margin:0;padding-left:15px;padding-right:20px">
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:24px;color:#ffffff;font-size:16px">
                                                                                            Name: {{BUYER_NAME}}
                                                                                        </p>
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:24px;color:#ffffff;font-size:16px">
                                                                                            Email: {{BUYER_EMAIL}}
                                                                                        </p>
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:24px;color:#ffffff;font-size:16px"><br></p>
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:24px;color:#ffffff;font-size:16px">
                                                                                            <strong>{{PRODUCT_NAME}}</strong>
                                                                                        </p>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <table cellspacing="0" cellpadding="0" align="right" style="border-collapse:collapse;border-spacing:0px;float:right">
                                                            <tbody>
                                                                <tr style="border-collapse:collapse">
                                                                    <td align="left" style="padding:0;margin:0;width:278px">
                                                                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                                                                            <tbody>
                                                                                <tr style="border-collapse:collapse">
                                                                                    <td align="right" style="padding:0;margin:0;padding-right:15px;padding-left:20px">
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:24px;color:#ffffff;font-size:16px">
                                                                                            Order date: {{DATE}}
                                                                                        </p>
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:24px;color:#ffffff;font-size:16px"><br></p>
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:24px;color:#ffffff;font-size:16px"><br></p>
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:24px;color:#ffffff;font-size:16px">
                                                                                            <strong style="line-height:150%">{{PRICE}}</strong>
                                                                                        </p>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr style="border-collapse:collapse">
                                                    <td style="margin:0;padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px;background-color:#1e1e1e" bgcolor="#1e1e1e" align="left">
                                                        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-spacing:0px">
                                                            <tbody>
                                                                <tr style="border-collapse:collapse">
                                                                    <td valign="top" align="center" style="padding:0;margin:0;width:580px">
                                                                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                                                                            <tbody>
                                                                                <tr style="border-collapse:collapse">
                                                                                    <td align="left" style="padding:0;margin:0;padding-top:5px;padding-left:25px;padding-right:25px">
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:21px;color:#ffffff;font-size:14px">
                                                                                            Billed {{PRICE}} for every 30 days
                                                                                        </p>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr style="border-collapse:collapse">
                                                                                    <td align="left" style="padding:0;margin:0;padding-top:5px;padding-left:25px;padding-right:25px">
                                                                                        <p style="margin:0;font-family:Arial,sans-serif;line-height:21px;color:#ffffff;font-size:14px">
                                                                                            Last day of payment is {{LAST_PAYMENT_DATE}}
                                                                                        </p>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr style="border-collapse:collapse">
                                                                                    <td bgcolor="#1e1e1e" align="center" style="padding:20px;margin:0;font-size:0">
                                                                                        <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                                                                                            <tbody>
                                                                                                <tr style="border-collapse:collapse">
                                                                                                    <td style="padding:0;margin:0;border-bottom:1px solid #efefef;background:none 0% 0% repeat scroll #ffffff;height:1px;width:100%;margin:0px"></td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr style="border-collapse:collapse">
                                                                                    <td bgcolor="#1e1e1e" style="padding:0;margin:0;padding-bottom:15px;padding-left:25px;padding-right:25px">
                                                                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                                                                                            <tbody style="font-family:Arial,sans-serif;line-height:21px;color:#242424">
                                                                                                <tr style="border-collapse:collapse">
                                                                                                    <td style="padding:0;margin:0;padding-top:10px;color:#ffffff;font-size:14px" align="left">Subtotal:</td>
                                                                                                    <td style="padding:0;margin:0;padding-top:10px;text-align:right;color:#ffffff;font-size:14px" align="right">{{SUBTOTAL}}</td>
                                                                                                </tr>
                                                                                                <tr style="border-collapse:collapse">
                                                                                                    <td style="padding:0;margin:0;padding-top:10px;font-size:18px;line-height:36px;color:#ffffff" align="left"><strong>Order Total:</strong></td>
                                                                                                    <td style="padding:0;margin:0;padding-top:10px;text-align:right;font-size:18px;line-height:36px;color:#ffffff" align="right"><strong>{{TOTAL}}</strong></td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr style="border-collapse:collapse">
                                                    <td align="center" bgcolor="#fd3363" style="padding:30px;margin:0;background-color:#fd3363">
                                                        <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border-spacing:0px">
                                                            <tr style="border-collapse:collapse">
                                                                <td align="center" valign="top" style="padding:0;margin:0">
                                                                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                                                                        <tr style="border-collapse:collapse">
                                                                            <td align="center" bgcolor="#fd3363" style="padding:0;margin:0">
                                                                                <a href="{{PORTAL_URL}}" style="text-decoration:none;color:#ffffff;font-size:18px;display:block;background:#242424;border-radius:30px;font-family:'lucida sans unicode','lucida grande',sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:100%;text-align:center;padding:15px 20px;box-sizing:border-box" target="_blank">
                                                                                    Access Customer Portal
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>`
  };

  return templates[templateId] || '';
};