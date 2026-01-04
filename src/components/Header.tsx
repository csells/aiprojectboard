import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut, Sparkles } from "lucide-react";

interface HeaderProps {
  isLoggedIn: boolean;
  userName?: string;
  onLogin: () => void;
  onLogout: () => void;
  onNewProject: () => void;
}

export function Header({ isLoggedIn, userName, onLogin, onLogout, onNewProject }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">AI Builders</h1>
            <p className="text-xs text-muted-foreground">Community Showcase</p>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Hey, <span className="text-primary">{userName}</span>
              </span>
              <Button variant="glow" size="sm" onClick={onNewProject}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Share Project</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={onLogin}>
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
