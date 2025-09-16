import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImageToHTMLRequest {
  imageBase64: string;
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
    const { imageBase64 }: ImageToHTMLRequest = await req.json();

    console.log("Processing image to HTML conversion...");

    if (!imageBase64) {
      console.error("No image data provided");
      return new Response(
        JSON.stringify({ error: "Missing image data" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAIApiKey) {
      console.error("OpenAI API key not found in environment variables");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Calling OpenAI Vision API...");

    // Call OpenAI Vision API to analyze the receipt image
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this receipt image and convert it to HTML email template with the following requirements:
                
1. Extract all text content, amounts, dates, and layout structure
2. Create email-safe HTML with inline CSS styling
3. Match the visual design as closely as possible
4. Replace dynamic content with placeholders like {{BUYER_NAME}}, {{AMOUNT}}, {{DATE}}, {{ORDER_ID}}, {{PRODUCT_NAME}}, etc.
5. Make it responsive for email clients
6. Use proper table layouts for email compatibility
7. Include all styling inline (no external CSS)
8. If there are images/logos, use placeholder URLs like {{LOGO_URL}} or {{PRODUCT_IMAGE_URL}}

Return only the HTML code without any markdown formatting or explanations.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ 
          error: "AI processing failed",
          details: errorData.error?.message || "Unknown OpenAI error"
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    const generatedHTML = data.choices[0]?.message?.content;

    if (!generatedHTML) {
      console.error("No HTML generated from OpenAI response");
      return new Response(
        JSON.stringify({ error: "Failed to generate HTML from image" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Successfully generated HTML from image");

    return new Response(
      JSON.stringify({ 
        html: generatedHTML,
        message: "HTML generated successfully from image" 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error processing image:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process image",
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