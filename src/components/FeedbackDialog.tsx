import { useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lightbulb, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Cloudflare Turnstile site key (public key, safe to embed)
const TURNSTILE_SITE_KEY = "0x4AAAAAAACKeAgxMCFbui95I";

interface FeedbackDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "error-callback"?: () => void;
        "expired-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
        size?: "normal" | "compact";
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export const FeedbackDialog = ({ open, onOpenChange, trigger }: FeedbackDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Use controlled or uncontrolled mode
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  // Load Turnstile script
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      console.warn("TURNSTILE_SITE_KEY not configured");
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    if (existingScript) {
      // Script exists, check if turnstile is available
      if (window.turnstile) {
        setTurnstileLoaded(true);
      } else {
        // Wait for it to load
        existingScript.addEventListener('load', () => setTurnstileLoaded(true));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Turnstile script loaded");
      setTurnstileLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Turnstile script");
    };
    document.head.appendChild(script);

    return () => {
      // Clean up widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  // Render Turnstile widget when dialog opens
  useEffect(() => {
    if (!isOpen || !TURNSTILE_SITE_KEY) return;
    
    // Reset token when dialog opens
    setTurnstileToken("");
    
    // Clean up previous widget
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (e) {
        console.warn("Error removing turnstile widget:", e);
      }
      widgetIdRef.current = null;
    }

    // Function to render the widget
    const renderWidget = () => {
      if (!turnstileRef.current) {
        console.error("Turnstile container ref not available");
        return false;
      }
      
      if (!window.turnstile) {
        console.error("Turnstile not available on window");
        return false;
      }
      
      // Clear any existing content in the container
      turnstileRef.current.innerHTML = '';
      
      try {
        console.log("Rendering Turnstile widget to container", turnstileRef.current);
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            console.log("Turnstile verified successfully");
            setTurnstileToken(token);
          },
          "error-callback": () => {
            console.error("Turnstile error callback triggered");
            setTurnstileToken("");
          },
          "expired-callback": () => {
            console.log("Turnstile token expired");
            setTurnstileToken("");
          },
          theme: "dark",
          size: "normal",
        });
        console.log("Turnstile widget created with ID:", widgetIdRef.current);
        return true;
      } catch (e) {
        console.error("Error rendering turnstile:", e);
        return false;
      }
    };

    // Use a longer delay and ensure DOM is ready
    const timeout = setTimeout(() => {
      if (window.turnstile) {
        renderWidget();
      } else {
        // If turnstile isn't loaded yet, poll for it
        let attempts = 0;
        const maxAttempts = 40; // 10 seconds
        const interval = setInterval(() => {
          attempts++;
          console.log("Polling for turnstile, attempt", attempts);
          if (window.turnstile) {
            clearInterval(interval);
            setTurnstileLoaded(true);
            renderWidget();
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.error("Turnstile failed to load after", maxAttempts, "attempts");
          }
        }, 250);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!turnstileToken && TURNSTILE_SITE_KEY) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-feedback", {
        body: { name, email, message, turnstileToken },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Success - close dialog first, then show toast
      setName("");
      setEmail("");
      setMessage("");
      setTurnstileToken("");
      setIsOpen(false);
      toast.success("Thank you for your suggestion! We'll review it soon.");
    } catch (error: any) {
      console.error("Feedback error:", error);
      
      // Reset CAPTCHA on error
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        setTurnstileToken("");
      }
      
      toast.error(error.message || "Failed to send suggestion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Lightbulb className="h-4 w-4" />
      Suggestion Box
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggestion Box</DialogTitle>
          <DialogDescription>
            Have an idea to make this better? We'd love to hear from you!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-name">Your Name</Label>
            <Input
              id="feedback-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-email">Your Email</Label>
            <Input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Your Message</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I think it would be great if..."
              rows={4}
              required
            />
          </div>
          
          {/* Cloudflare Turnstile CAPTCHA */}
          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center">
              <div ref={turnstileRef} />
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting || (TURNSTILE_SITE_KEY && !turnstileToken)}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Message
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};