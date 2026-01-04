import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | AI Builders Community</title>
        <meta name="description" content="Privacy Policy for the AI Builders Community Showcase platform." />
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
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg">
              Last updated: January 2026
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create an account (email, username)</li>
                <li>Submit a project (title, description, URLs, tags)</li>
                <li>Post comments</li>
                <li>Update your profile (bio, avatar, social links)</li>
                <li>Contact us through the Suggestion Box</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Provide and maintain the Service</li>
                <li>Display your projects and profile to other users</li>
                <li>Send you important updates about the Service</li>
                <li>Respond to your inquiries and suggestions</li>
                <li>Improve and optimize the Service</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Information Sharing</h2>
              <p>
                We do not sell your personal information. We may share your information:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent abuse</li>
                <li>With service providers who assist in operating the Service</li>
              </ul>
              <p className="mt-2">
                Your public profile information and submitted projects are visible to all users of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Your Rights</h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">7. Cookies</h2>
              <p>
                We use essential cookies to maintain your session and remember your preferences. We do not use third-party tracking cookies for advertising purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">8. Third-Party Services</h2>
              <p>
                The Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">9. Children's Privacy</h2>
              <p>
                The Service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">11. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us through the Suggestion Box on our website.
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

export default Privacy;