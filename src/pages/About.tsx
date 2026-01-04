import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Sparkles, Heart, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Helmet } from "react-helmet-async";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About | AI Builders Community</title>
        <meta name="description" content="Learn about the AI Builders Community Showcase - a platform inspired by Nate Jones and built by Chris Sells." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">AI Builders</h1>
                <p className="text-xs text-muted-foreground">Community Showcase</p>
              </div>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">About AI Builders</h1>
            <p className="text-lg text-muted-foreground">
              A community showcase for AI projects and builders
            </p>
          </div>

          <div className="prose prose-invert mx-auto space-y-8">
            {/* Inspiration Section */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Inspiration
              </h2>
              <p className="text-muted-foreground mb-4">
                This project was inspired by{" "}
                <a 
                  href="https://natejones.substack.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Nate Jones of Nate's Substack
                  <ExternalLink className="h-3 w-3" />
                </a>
                , who has built an amazing community of AI builders and enthusiasts sharing their projects and learnings.
              </p>
              <p className="text-muted-foreground">
                The goal is to create a dedicated space where community members can showcase their AI projects, 
                find collaborators, and get inspired by what others are building.
              </p>
            </section>

            {/* Builder Section */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Built By</h2>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <img 
                    src="https://cdn.blot.im/blog_12688eba996c4a98b1ec3a945e78e4f1/_avatars/2daebd98-55ac-4462-b80d-a1bb7156ce67.jpg"
                    alt="Chris Sells"
                    className="w-24 h-24 rounded-full border-2 border-primary/30"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Chris Sells</h3>
                  <p className="text-muted-foreground mb-4">
                    Chris is a consultant in applied AI for developer tools, frameworks and ecosystems. 
                    He's the founder and chief proprietor of sellsbrothers.com, which has been around since 1995.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href="https://sellsbrothers.com/about" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary text-sm text-foreground hover:border-primary/50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Website
                    </a>
                    <a 
                      href="https://github.com/csells" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary text-sm text-foreground hover:border-primary/50 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                    <a 
                      href="https://twitter.com/csells" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary text-sm text-foreground hover:border-primary/50 transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </a>
                    <a 
                      href="https://linkedin.com/in/csells" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary text-sm text-foreground hover:border-primary/50 transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                    <a 
                      href="mailto:csells@sellsbrothers.com"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary text-sm text-foreground hover:border-primary/50 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Tech Stack */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Technology</h2>
              <p className="text-muted-foreground mb-4">
                This project is built with modern web technologies:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>React + TypeScript for the frontend</li>
                <li>Tailwind CSS for styling</li>
                <li>Lovable Cloud for backend services</li>
                <li>Built with ❤️ using Lovable</li>
              </ul>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/30 py-8 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Builders Community Showcase
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default About;