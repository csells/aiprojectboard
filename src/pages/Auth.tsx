import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Rocket, ArrowLeft, Mail, KeyRound, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type AuthMode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Check for password reset flow from URL
    const type = searchParams.get("type");
    if (type === "recovery") {
      setMode("reset");
    }
  }, [searchParams]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        return;
      }
      if (session && mode !== "reset") {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mode !== "reset") {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, mode]);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      toast.error(error.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });
      if (error) throw error;
      setEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username || email.split("@")[0],
            },
          },
        });
        if (error) throw error;
        toast.success("Account created! You're now logged in.");
      }
    } catch (error: any) {
      if (error.message.includes("User already registered")) {
        toast.error("This email is already registered. Try logging in instead.");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset password form
  if (mode === "reset") {
    return (
      <>
        <Helmet>
          <title>Reset Password | AI Builders Community</title>
          <meta name="description" content="Set a new password for your AI Builders Community account." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Set New Password
              </h1>
              <p className="mt-2 text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-secondary"
                  />
                </div>

                <Button type="submit" variant="glow" className="w-full" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Forgot password form
  if (mode === "forgot") {
    return (
      <>
        <Helmet>
          <title>Forgot Password | AI Builders Community</title>
          <meta name="description" content="Reset your password for AI Builders Community." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Reset Password
              </h1>
              <p className="mt-2 text-muted-foreground">
                We'll send you a link to reset your password
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              {emailSent ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-foreground mb-2">Check your email</h2>
                  <p className="text-muted-foreground mb-4">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false);
                      setMode("login");
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="bg-secondary"
                    />
                  </div>

                  <Button type="submit" variant="glow" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Sign In
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{mode === "login" ? "Sign In" : "Sign Up"} | AI Builders Community</title>
        <meta name="description" content={mode === "login" ? "Sign in to your AI Builders Community account to share and discover AI projects." : "Create an account to join AI Builders Community and start sharing your AI projects."} />
        <meta name="keywords" content="login, sign up, AI Builders, community, account" />
      </Helmet>
      
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {mode === "login" ? "Welcome Back" : "Join the Community"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {mode === "login"
                ? "Sign in to share your projects"
                : "Create an account to start building"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <Button
              type="button"
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your display name"
                    className="bg-secondary"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-secondary"
                />
              </div>

              <Button type="submit" variant="glow" className="w-full" disabled={loading}>
                {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;