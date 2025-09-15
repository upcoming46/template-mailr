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
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to send email');
    }

    return data;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
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