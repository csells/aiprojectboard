import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema - email collected for reply but NOT stored in database
const feedbackSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message too long"),
});

const sendEmail = async (to: string[], subject: string, html: string) => {
  console.log(`Attempting to send email to: ${to.join(", ")}, subject: ${subject}`);
  
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "AI Builders <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  const responseText = await res.text();
  console.log(`Resend API response (${res.status}):`, responseText);

  if (!res.ok) {
    // Check if it's a domain verification error
    if (responseText.includes("verify a domain")) {
      console.log("Domain not verified - email cannot be sent to external recipients");
      throw new Error("Email service configuration required. Please contact the administrator.");
    }
    throw new Error(`Email sending failed: ${responseText}`);
  }

  return JSON.parse(responseText);
};

// Simple HTML escaping function to prevent XSS in email content
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional authentication - try to get user if available, but allow anonymous
    let userId = 'anonymous';
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    console.log('Submission from user:', userId);

    // Parse and validate input
    const rawInput = await req.json();
    const parseResult = feedbackSchema.safeParse(rawInput);
    
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(', ');
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email, message } = parseResult.data;

    // Get the recipient email from environment
    const recipientEmail = Deno.env.get("FEEDBACK_EMAIL");
    
    if (!recipientEmail) {
      console.error("No FEEDBACK_EMAIL configured");
      return new Response(
        JSON.stringify({ error: "Email not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("No RESEND_API_KEY configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Escape user input to prevent XSS in email content
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    // Send notification to admin with reply-to email (NOT stored in database)
    const adminEmailResponse = await sendEmail(
      [recipientEmail],
      `New Suggestion from ${safeName}`,
      `
        <h2>New Suggestion Received</h2>
        <p><strong>From:</strong> ${safeName}</p>
        <p><strong>Reply to:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <p><strong>User ID:</strong> ${userId}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, "<br>")}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">This suggestion was submitted through AI Builders Community Showcase. Reply directly to the sender's email above.</p>
      `
    );

    console.log("Admin notification sent:", adminEmailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-feedback function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
