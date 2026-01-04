import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotifyCommentRequest {
  projectId: string;
  commenterId: string;
  commenterName: string;
  commentContent: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, commenterId, commenterName, commentContent }: NotifyCommentRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get project info and owner
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("title, user_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      console.error("Project not found:", projectError);
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Don't send notification if the commenter is the project owner
    if (project.user_id === commenterId) {
      return new Response(
        JSON.stringify({ message: "Skipped: owner commented on own project" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has disabled email notifications
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_on_comments")
      .eq("user_id", project.user_id)
      .maybeSingle();

    if (prefs && prefs.email_on_comments === false) {
      return new Response(
        JSON.stringify({ message: "Skipped: user disabled comment notifications" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get owner's email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(project.user_id);

    if (userError || !userData?.user?.email) {
      console.error("User email not found:", userError);
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const ownerEmail = userData.user.email;
    const siteUrl = Deno.env.get("SITE_URL") || "https://aiprojectboard.lovable.app";
    const projectUrl = `${siteUrl}/project/${projectId}`;

    const emailResponse = await resend.emails.send({
      from: "AI Project Board <onboarding@resend.dev>",
      to: [ownerEmail],
      subject: `New comment on "${project.title}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Comment on Your Project</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin-top: 0;">Hey there! 👋</p>
            <p><strong>${commenterName}</strong> just left a comment on your project "<strong>${project.title}</strong>":</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1; margin: 20px 0;">
              <p style="margin: 0; font-style: italic; color: #4b5563;">"${commentContent}"</p>
            </div>
            <a href="${projectUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 10px;">View Comment</a>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              — The AI Project Board Team
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-comment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
