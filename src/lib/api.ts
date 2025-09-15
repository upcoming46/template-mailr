export interface EmailRequest {
  to: string;
  subject: string;
  fromName?: string;
  fromEmail?: string;
  html: string;
}

export const sendEmail = async (emailData: EmailRequest): Promise<void> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
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