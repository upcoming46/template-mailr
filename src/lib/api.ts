import { supabase } from "@/integrations/supabase/client";

export interface EmailRequest {
  to: string;
  subject: string;
  fromName?: string;
  fromEmail?: string;
  html: string;
}

export const sendEmail = async (emailData: EmailRequest): Promise<void> => {
  try {
    console.log('=== SENDING EMAIL ===');
    console.log('Email data:', {
      to: emailData.to,
      subject: emailData.subject,
      fromName: emailData.fromName,
      htmlLength: emailData.html?.length
    });

    // Use direct fetch to avoid Supabase client connection issues
    const response = await fetch(
      'https://abhpwnfajkjxoyudvfwp.supabase.co/functions/v1/send-email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      }
    );

    console.log('=== RESPONSE STATUS ===', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== SERVER ERROR ===', errorText);
      throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('=== SUCCESS RESULT ===', result);

    if (result.error) {
      throw new Error(result.error.details || result.error || 'Email service error');
    }

    return result;
  } catch (error) {
    console.error('=== CATCH ERROR ===', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while sending email');
  }
};

export const convertImageToHTML = async (imageFile: File) => {
  // Convert file to base64
  const reader = new FileReader();
  const imageBase64 = await new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const { data, error } = await supabase.functions.invoke('convert-image-to-html', {
    body: { imageBase64 }
  });

  if (error) {
    throw new Error(error.message || 'Failed to process image');
  }

  return data;
};

export const uploadFile = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};