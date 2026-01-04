import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [emailOnComments, setEmailOnComments] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchPreferences() {
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("email_on_comments")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching preferences:", error);
      } else if (data) {
        setEmailOnComments(data.email_on_comments);
      }
      setLoading(false);
    }

    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const handleToggle = async (checked: boolean) => {
    if (!user) return;
    
    setSaving(true);
    setEmailOnComments(checked);

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        email_on_comments: checked,
      }, {
        onConflict: "user_id"
      });

    if (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
      setEmailOnComments(!checked);
    } else {
      toast.success("Preferences saved");
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Settings | AI Project Board</title>
        <meta name="description" content="Manage your notification preferences and account settings" />
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        <Header
          isLoggedIn={!!user}
          userName={user?.email?.split("@")[0]}
          onLogin={() => navigate("/auth")}
          onLogout={signOut}
          onNewProject={() => {}}
        />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications from the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-comments" className="text-base">
                    Email notifications for comments
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive an email when someone comments on your projects
                  </p>
                </div>
                <Switch
                  id="email-comments"
                  checked={emailOnComments}
                  onCheckedChange={handleToggle}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
}