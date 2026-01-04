import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Guidelines = () => {
  return (
    <>
      <Helmet>
        <title>Community Guidelines | AI Builders Community</title>
        <meta name="description" content="Community Guidelines for the AI Builders Community Showcase platform." />
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Community Guidelines</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Our goal is to create a welcoming space for AI builders to share, learn, and collaborate.
          </p>
          
          <div className="prose prose-invert max-w-none space-y-8">
            {/* Encouraged Behaviors */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                What We Encourage
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong className="text-foreground">Share your work</strong> - Whether it's a polished product or an early experiment, we want to see what you're building.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong className="text-foreground">Be helpful</strong> - Offer constructive feedback, answer questions, and help others learn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong className="text-foreground">Give credit</strong> - Acknowledge the tools, libraries, and inspirations that helped you build your project.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong className="text-foreground">Be inclusive</strong> - Welcome newcomers and respect people of all skill levels and backgrounds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong className="text-foreground">Collaborate</strong> - Look for opportunities to work with others and contribute to open-source projects.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong className="text-foreground">Report issues</strong> - If you see content that violates these guidelines, let us know through the Suggestion Box.</span>
                </li>
              </ul>
            </section>

            {/* Prohibited Behaviors */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-destructive" />
                What's Not Allowed
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span><strong className="text-foreground">Spam or self-promotion</strong> - Don't post the same project multiple times or use the platform solely for marketing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span><strong className="text-foreground">Harassment or hate speech</strong> - Any form of discrimination, bullying, or personal attacks will result in immediate removal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span><strong className="text-foreground">Plagiarism</strong> - Don't claim others' work as your own. Always give proper attribution.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span><strong className="text-foreground">Malicious content</strong> - Projects containing malware, phishing attempts, or other harmful content are strictly prohibited.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span><strong className="text-foreground">Illegal content</strong> - Don't share projects that violate laws or regulations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span><strong className="text-foreground">Deceptive practices</strong> - Be honest about what your project does and doesn't do.</span>
                </li>
              </ul>
            </section>

            {/* Project Guidelines */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Project Submission Guidelines</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Clear title:</strong> Use a descriptive name that reflects what your project does.</li>
                <li><strong className="text-foreground">Good description:</strong> Explain what problem your project solves and how it works.</li>
                <li><strong className="text-foreground">Relevant tags:</strong> Use appropriate tags to help others discover your project.</li>
                <li><strong className="text-foreground">Quality screenshots:</strong> Include a clear screenshot or demo image if possible.</li>
                <li><strong className="text-foreground">Working links:</strong> Make sure your live demo and repository URLs are accessible.</li>
              </ul>
            </section>

            {/* Enforcement */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Enforcement</h2>
              <p className="text-muted-foreground mb-4">
                We take these guidelines seriously. Violations may result in:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Content removal</li>
                <li>Warning notifications</li>
                <li>Temporary suspension</li>
                <li>Permanent account ban</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We review all reports and make decisions based on the severity and context of each situation.
              </p>
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

export default Guidelines;