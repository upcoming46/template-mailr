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

    // Use Supabase client which handles CORS properly
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailData,
    });

    console.log('=== RESPONSE ===');
    console.log('Data:', data);
    console.log('Error:', error);

    if (error) {
      console.error('=== INVOKE ERROR ===', error);
      // Provide more helpful error message
      throw new Error(`Email service error: ${error.message || 'Connection failed'}. Please check your internet connection and try again.`);
    }

    if (!data || data.error) {
      console.error('=== DATA ERROR ===', data);
      throw new Error(data?.error?.details || data?.error || 'No response from email service');
    }

    console.log('=== SUCCESS ===');
    return data;
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