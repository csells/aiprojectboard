import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  name: string;
  email: string;
  message: string;
}

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: FeedbackRequest = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Send notification to admin
    const adminEmailResponse = await sendEmail(
      [recipientEmail],
      `New Suggestion from ${name}`,
      `
        <h2>New Suggestion Received</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
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
          <h2>Thank you, ${name}!</h2>
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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
