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
<html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light only" />
      <meta http-equiv="X-UA-Compatible" content="IE=Edge">
      <style type="text/css">
    body, p, div {
      font-family: arial,helvetica,sans-serif;
      font-size: 14px;
    }
    body {
      color: #000000;
    }
    body a {
      color: #2848F0;
      text-decoration: none;
    }
    p { margin: 0; padding: 0; }
    table.wrapper {
      width:100% !important;
      table-layout: fixed;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      -moz-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    img.max-width {
      max-width: 100% !important;
    }
    .column.of-2 {
      width: 50%;
    }
    .column.of-3 {
      width: 33.333%;
    }
    .column.of-4 {
      width: 25%;
    }
    ul ul ul ul  {
      list-style-type: disc !important;
    }
    ol ol {
      list-style-type: lower-roman !important;
    }
    ol ol ol {
      list-style-type: lower-latin !important;
    }
    ol ol ol ol {
      list-style-type: decimal !important;
    }
    @media screen and (max-width:480px) {
      .preheader .rightColumnContent,
      .footer .rightColumnContent {
        text-align: left !important;
      }
      .preheader .rightColumnContent div,
      .preheader .rightColumnContent span,
      .footer .rightColumnContent div,
      .footer .rightColumnContent span {
        text-align: left !important;
      }
      .preheader .rightColumnContent,
      .preheader .leftColumnContent {
        font-size: 80% !important;
        padding: 5px 0;
      }
      table.wrapper-mobile {
        width: 100% !important;
        table-layout: fixed;
      }
      img.max-width {
        height: auto !important;
        max-width: 100% !important;
      }
      a.bulletproof-button {
        display: block !important;
        width: auto !important;
        font-size: 80%;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      .columns {
        width: 100% !important;
      }
      .column {
        display: block !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
      .social-icon-column {
        display: inline-block !important;
      }
    }
  </style>
      <style>body, .wrapper { background-color: #EAEAEA; }</style>
    </head>
    <body style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#Eaeaea;">
      <center class="wrapper" data-link-color="#2848F0" data-body-style="font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#Eaeaea;">
        <div class="webkit">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#Eaeaea">
            <tr>
              <td valign="top" bgcolor="#Eaeaea" width="100%">
                <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="100%">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                      <tr>
                                        <td role="modules-container" style="padding:16px 16px 16px 16px; color:#000000; text-align:left;" bgcolor="#Eaeaea" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
    <tr>
      <td role="module-content">
        <p>Your purchase from {{SELLER_NAME}}!</p>
      </td>
    </tr>
  </table>
  
  <table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="edb73c3a-7676-4aad-a776-191820fb1587">
    <tbody>
      <tr>
        <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
          <a href="{{UNTITLED_URL}}">
          <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:25% !important; width:25%; height:auto !important; border-radius:10000px;" width="142" alt="{{SELLER_NAME}}'s profile picture" data-proportionally-constrained="true" data-responsive="true" src="{{SELLER_LOGO_URL}}">
          </a>
        </td>
      </tr>
    </tbody>
  </table>
  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="e1a68eb7-b385-479e-9fc1-0402b858aedc.1">
    <tbody>
      <tr>
        <td style="padding:0px 0px 16px 0px;" role="module-content" bgcolor=""></td>
      </tr>
    </tbody>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:16px 16px 16px 16px;" bgcolor="#ffffff" data-distribution="1">
    <tbody>
      <tr role="module-content">
        <td height="100%" valign="top">
          <table width="536" style="width:536px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table class="module" role="module" data-type="code" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="cf5252b4-ce92-4432-91d2-00cd66eb9d02">
                    <tbody>
                      <tr>
                        <td height="100%" valign="top" role="module-content">
                          <h1 style="text-align: center">Thanks for your order, {{BUYER_NAME}}! &#128591;</h1>
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

  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="e1a68eb7-b385-479e-9fc1-0402b858aedc.1.1">
    <tbody>
      <tr>
        <td style="padding:0px 0px 16px 0px;" role="module-content" bgcolor=""></td>
      </tr>
    </tbody>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:16px 16px 8px 16px;" bgcolor="#FFFFFF" data-distribution="1">
    <tbody>
      <tr role="module-content">
        <td height="100%" valign="top">
          <table width="536" style="width:536px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="product-name-heading" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 8px 0px; line-height:24px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><h2 style="text-align: inherit; margin: 0; font-size: 18px; font-weight: 700;">{{PRODUCT_NAME}}</h2></div>
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

  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:8px 16px 16px 16px;" bgcolor="#FFFFFF" data-distribution="2,1">
    <tbody>
      <tr role="module-content">
        <td height="100%" valign="middle" style="vertical-align: middle;">
          <table width="341" style="width:341px; border-spacing:0; border-collapse:collapse; margin:0px 12px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="9d13f5c6-f772-40b1-bd0d-3f8865006e9f.1.1" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 2px 0px; line-height:16px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><div style="font-family: inherit; text-align: inherit"><span style="color: #cc0000; font-family: helvetica, sans-serif; font-size: 12px; font-weight: 400;">Untitled URL</span></div></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="9d13f5c6-f772-40b1-bd0d-3f8865006e9f.2.1.1" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 0px 0px; line-height:16px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><div style="font-family: inherit; text-align: inherit"><span style="color: #000000; font-family: helvetica, sans-serif; font-size: 12px;">{{UNTITLED_URL}}</span></div></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
        <td height="100%" valign="middle" style="vertical-align: middle;">
          <table width="170" style="width:170px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 12px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-1">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="7e0d88a7-974e-4f54-8275-3806054930c0.1.1">
                    <tbody>
                      <tr>
                        <td align="right" bgcolor="" class="outer-td" style="padding:0px 0px 0px 0px;">
                          <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                            <tbody>
                              <tr>
                                <td align="center" bgcolor="#2848F0" class="inner-td" style="border-radius:6px; font-size:16px; text-align:right; background-color:inherit;">
                                  <a href="{{ACCESS_LINK}}" style="background-color:#2848F0; border:0px solid #ffffff; border-color:#ffffff; border-radius:8px; border-width:0px; color:#ffffff; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:helvetica,sans-serif;" target="_blank">Access link</a>
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
        </td>
      </tr>
    </tbody>
  </table>

  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="spacer1">
    <tbody>
      <tr>
        <td style="padding:0px 0px 16px 0px;" role="module-content" bgcolor=""></td>
      </tr>
    </tbody>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:16px 16px 8px 16px;" bgcolor="#FFFFFF" data-distribution="1">
    <tbody>
      <tr role="module-content">
        <td height="100%" valign="top">
          <table width="536" style="width:536px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c8ae93ae-50d0-4cf3-8e86-81f41c5771c5.2.1.1.3.2" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 8px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><h2 style="text-align: inherit; margin: 0;">Order Summary</h2></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="module" role="module" data-type="code" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="787a67e5-36d1-4587-b07f-635e56b899f7">
                    <tbody>
                      <tr>
                        <td height="100%" valign="top" role="module-content">
                          <div style="font-family: inherit; text-align: inherit; font-size: 14px; line-height: 20px;"><strong>Date: </strong>{{DATE}}</div>
                          <div style="font-family: inherit; text-align: inherit; font-size: 14px; line-height: 20px; margin-bottom: 12px;"><strong>Order #: </strong>{{ORDER_ID}}</div>
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

  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:8px 16px 8px 16px;" bgcolor="#FFFFFF" data-distribution="1,3">
    <tbody>
      <tr role="module-content">
        <td height="100%" valign="middle" style="vertical-align: middle;">
          <table width="100" style="width:100px; border-spacing:0; border-collapse:collapse; margin:0px 16px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="604e0d4b-6d89-42bc-b4ec-90cc9536aa1c">
                    <tbody>
                      <tr>
                        <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="left">
                          <a href="">
                            <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px; max-width:100% !important; width:100%; height:auto !important;" width="100" alt="product image" data-proportionally-constrained="true" data-responsive="true" src="{{PRODUCT_IMAGE_URL}}">
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
        <td height="100%" valign="middle" style="vertical-align: middle;">
          <table width="404" style="width:404px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-1">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="017a5c60-9f05-478c-9915-5c4bdc0804de" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 2px 0px; line-height:18px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><div style="font-family: inherit; text-align: inherit; font-size: 14px; font-weight: 400;">{{PRODUCT_NAME}}</div></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="017a5c60-9f05-478c-9915-5c4bdc0804de.1" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 0px 0px; line-height:18px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><div style="font-family: inherit; text-align: inherit"><span style="color: #000000; font-family: helvetica, sans-serif; font-size: 14px;">{{PRICE}}</span></div></div>
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

  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:8px 16px 16px 16px;" bgcolor="#FFFFFF" data-distribution="1">
    <tbody>
      <tr role="module-content">
        <td height="100%" valign="top">
          <table width="536" style="width:536px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c8ae93ae-50d0-4cf3-8e86-81f41c5771c5.2.1.1.1" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 0px 0px; line-height:18px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><div style="font-family: inherit; text-align: inherit; font-size: 14px;">Visit the <a href="{{CUSTOMER_PORTAL_URL}}" style="color: #2848F0; text-decoration: none;">customer portal</a> to manage your order and access your content any time.</div></div>
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

  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="e1a68eb7-b385-479e-9fc1-0402b858aedc">
    <tbody>
      <tr>
        <td style="padding:0px 0px 16px 0px;" role="module-content" bgcolor=""></td>
      </tr>
    </tbody>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:0px 16px 16px 16px;" bgcolor="#FFFFFF" data-distribution="1">
    <tbody>
      <tr role="module-content">
        <td height="100%" valign="top">
          <table width="536" style="width:536px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c8ae93ae-50d0-4cf3-8e86-81f41c5771c5.2.1.2" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 0px 0px; line-height:18px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><h2 style="text-align: inherit">Your feedback matters!</h2><div></div></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c8ae93ae-50d0-4cf3-8e86-81f41c5771c5.2.1.1.2.1.1" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 0px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><div style="font-family: inherit; text-align: inherit">Share your experience and help others with your product review!</div><div></div></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="module" role="module" data-type="code" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="24f78b40-f332-4d11-be44-428c5a0d2c46">
                    <tbody>
                      <tr>
                        <td height="100%" valign="top" role="module-content">
                          <center>
                            <div style="width:100%; text-align:center; max-width: 500px; margin-top:10px; background-color: #ffffff;">
                              <span style="width: calc(100% / 8); display: inline-block; vertical-align: top; text-align:center; margin:2%; font-size: 20px;"><a href="{{ACCESS_LINK}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" style="height:32px;width:32px;display:block;border:0;outline:none;text-decoration:none;"></a></span>
                              <span style="width: calc(100% / 8); display: inline-block; vertical-align: top; text-align:center; margin:2%; font-size: 20px;"><a href="{{ACCESS_LINK}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" style="height:32px;width:32px;display:block;border:0;outline:none;text-decoration:none;"></a></span>
                              <span style="width: calc(100% / 8); display: inline-block; vertical-align: top; text-align:center; margin:2%; font-size: 20px;"><a href="{{ACCESS_LINK}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" style="height:32px;width:32px;display:block;border:0;outline:none;text-decoration:none;"></a></span>
                              <span style="width: calc(100% / 8); display: inline-block; vertical-align: top; text-align:center; margin:2%; font-size: 20px;"><a href="{{ACCESS_LINK}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" style="height:32px;width:32px;display:block;border:0;outline:none;text-decoration:none;"></a></span>
                              <span style="width: calc(100% / 8); display: inline-block; vertical-align: top; text-align:center; margin:2%; font-size: 20px;"><a href="{{ACCESS_LINK}}"><img src="http://cdn.mcauto-images-production.sendgrid.net/c3193010637ead88/f8c747f3-40be-4b6e-8219-4d9b55d7281f/68x65.png" style="height:32px;width:32px;display:block;border:0;outline:none;text-decoration:none;"></a></span>
                            </div>
                          </center>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="3a42879e-1431-4ee1-ad98-f71409de2009">
                    <tbody>
                      <tr>
                        <td align="center" bgcolor="" class="outer-td" style="padding:8px 16px 8px 16px;">
                          <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                            <tbody>
                              <tr>
                                <td align="center" bgcolor="#2848F0" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
                                  <a href="{{ACCESS_LINK}}" style="background-color:#2848F0; border:0px solid #333333; border-color:#333333; border-radius:8px; border-width:0px; color:#ffffff; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:helvetica,sans-serif;" target="_blank">Leave a review</a>
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
        </td>
      </tr>
    </tbody>
  </table>

  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="e1a68eb7-b385-479e-9fc1-0402b858aedc.3">
    <tbody>
      <tr>
        <td style="padding:0px 0px 16px 0px;" role="module-content" bgcolor=""></td>
      </tr>
    </tbody>
  </table>

  <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:16px 16px 16px 16px;" bgcolor="#FFFFFF" data-distribution="1">
    <tbody>
      <tr role="module-content">
        <td height="100%" valign="top">
          <table width="536" style="width:536px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
            <tbody>
              <tr>
                <td style="padding:0px;margin:0px;border-spacing:0;">
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c8ae93ae-50d0-4cf3-8e86-81f41c5771c5.2.1.2.1" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 8px 0px; line-height:22px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><h2 style="text-align: inherit; margin: 0; font-size: 18px; font-weight: 700;">Need help?</h2></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c8ae93ae-50d0-4cf3-8e86-81f41c5771c5.2.1.1.2.1" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 0px 0px; line-height:18px; text-align:inherit;" height="100%" valign="top" bgcolor="" role="module-content">
                          <div><div style="font-family: inherit; text-align: inherit; font-size: 14px;">If you have any questions or need assistance with your order, feel free to contact {{SELLER_NAME}} directly.</div></div>
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

  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="e1a68eb7-b385-479e-9fc1-0402b858aedc.3">
    <tbody>
      <tr>
        <td style="padding:0px 0px 32px 0px;" role="module-content" bgcolor=""></td>
      </tr>
    </tbody>
  </table>

  <table class="module" role="module" data-type="code" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="d7a29260-9b37-436c-87db-ae160017a203">
    <tbody>
      <tr>
        <td height="100%" valign="top" role="module-content">
          <center>
            <a href="{{UNTITLED_URL}}">
              <img src="https://cdn.beacons.ai/images/beacons_assets/made-with-beacons.png" alt="made with beacons" style="height:40px;display:block;border:0;outline:none;text-decoration:none;">
            </a>
          </center>

          <center style="color:#757575;font-size:12px;padding-left:16px;padding-right:16px;padding-top:24px;">
            You are getting this receipt email because you bought a product from <a style="cursor:pointer;text-decoration:none;color:#757575;font-weight:bold;" href="{{UNTITLED_URL}}" target="_blank">{{SELLER_NAME}}</a>.
            If you'd like to stop receiving future marketing messages, please <a style="cursor:pointer;text-decoration:underline;color:#757575;" href="{{CUSTOMER_PORTAL_URL}}" target="_blank">unsubscribe</a> from the list.
          </center>
        </td>
      </tr>
    </tbody>
  </table>
  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="e1a68eb7-b385-479e-9fc1-0402b858aedc.3.1">
    <tbody>
      <tr>
        <td style="padding:0px 0px 32px 0px;" role="module-content" bgcolor=""></td>
      </tr>
    </tbody>
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
              </td>
            </tr>
          </table>
        </div>
      </center>
    <img src="https://c.info.beacons.ai/wf/open?upn=tracking" alt="" width="1" height="1" border="0" style="height:1px !important;width:1px !important;border-width:0 !important;margin-top:0 !important;margin-bottom:0 !important;margin-right:0 !important;margin-left:0 !important;padding-top:0 !important;padding-bottom:0 !important;padding-right:0 !important;padding-left:0 !important;"/>
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