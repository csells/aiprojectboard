import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
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
    // Authentication check - require valid user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Invalid authentication:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Authenticated user:', user.id);

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

    // Send notification to admin
    const adminEmailResponse = await sendEmail(
      [recipientEmail],
      `New Suggestion from ${safeName}`,
      `
        <h2>New Suggestion Received</h2>
        <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
        <p><strong>User ID:</strong> ${user.id}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, "<br>")}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">This suggestion was submitted through AI Builders Community Showcase.</p>
      `
    );

    console.log("Admin notification sent:", adminEmailResponse);

    // Try to send confirmation to user (may fail if domain not verified - that's OK)
    try {
      const userEmailResponse = await sendEmail(
        [email],
        "Thank you for your suggestion!",
        `
          <h2>Thank you, ${safeName}!</h2>
          <p>We've received your suggestion and appreciate you taking the time to share your thoughts with us.</p>
          <p>We'll review your message and get back to you if needed.</p>
          <br />
          <p>Best regards,<br>The AI Builders Team</p>
        `
      );
      console.log("User confirmation sent:", userEmailResponse);
    } catch (userEmailError) {
      // User confirmation failed (likely domain not verified) - that's OK, admin got the message
      console.log("User confirmation email could not be sent (domain may not be verified):", userEmailError);
    }

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
