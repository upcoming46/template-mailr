import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  fromName?: string;
  fromEmail?: string;
  html: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    const body: EmailRequest = await req.json();
    const { to, subject, fromName, fromEmail, html } = body;

    console.log("Received email request:", { to, subject, fromName, fromEmail, htmlLength: html?.length });

    if (!to || !subject || !html) {
      console.error("Missing required fields:", { to: !!to, subject: !!subject, html: !!html });
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const resend = new Resend(resendApiKey);

    // Use fanbasis.site domain for all templates
    const emailData = {
      from: `${fromName || 'Receipt'} <support@fanbasis.site>`,
      to: [to],
      subject: subject,
      html: html,
    };

    console.log("Sending email with Resend API...");

    const result = await resend.emails.send(emailData);

    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.data?.id || result.id,
        message: "Email sent successfully" 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);