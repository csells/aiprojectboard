import { Link } from "react-router-dom";
import { FeedbackDialog } from "@/components/FeedbackDialog";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border bg-card/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6">
          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <span className="text-border">•</span>
            <Link to="/guidelines" className="hover:text-primary transition-colors">
              Community Guidelines
            </Link>
            <span className="text-border">•</span>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <span className="text-border">•</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="text-border">•</span>
            <FeedbackDialog />
          </nav>
          
          {/* Copyright */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>
              © Copyright Sells Brothers, Inc. {currentYear}. All rights reserved.
            </p>
            <p>
              No warranties extended or implied.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}