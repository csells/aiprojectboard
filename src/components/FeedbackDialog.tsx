import { useState, ReactNode, useRef } from "react";
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

interface FeedbackDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
}

export const FeedbackDialog = ({ open, onOpenChange, trigger }: FeedbackDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const formStartTime = useRef<number>(0);

  // Use controlled or uncontrolled mode
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Honeypot check - if filled, it's a bot
    if (honeypotRef.current?.value) {
      console.log("Honeypot triggered - likely bot");
      toast.success("Thank you for your suggestion!");
      setName("");
      setEmail("");
      setMessage("");
      setIsOpen(false);
      return;
    }

    // Time-based check - form filled too fast (under 3 seconds) is likely a bot
    const elapsedTime = Date.now() - formStartTime.current;
    if (elapsedTime < 3000) {
      console.log("Form submitted too quickly - likely bot");
      toast.success("Thank you for your suggestion!");
      setName("");
      setEmail("");
      setMessage("");
      setIsOpen(false);
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-feedback", {
        body: { 
          name, 
          email, 
          message,
          // Send honeypot value for server-side validation too
          website: honeypotRef.current?.value || ""
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Success
      setName("");
      setEmail("");
      setMessage("");
      setIsOpen(false);
      toast.success("Thank you for your suggestion! We'll review it soon.");
    } catch (error: any) {
      console.error("Feedback error:", error);
      toast.error(error.message || "Failed to send suggestion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (newOpen) {
      formStartTime.current = Date.now();
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Lightbulb className="h-4 w-4" />
      Suggestion Box
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
          
          {/* Honeypot field - hidden from users, visible to bots */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            className="absolute -left-[9999px] opacity-0 h-0 w-0"
            aria-hidden="true"
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting}
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