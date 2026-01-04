import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Privacy = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Privacy Policy | AI Project Board</title>
        <meta name="description" content="Learn how AI Project Board collects, uses, and protects your personal information." />
        <meta name="keywords" content="privacy policy, data protection, AI Project Board, security, GDPR" />
        <link rel="canonical" href="https://aiprojectboard.com/privacy" />
        <meta property="og:title" content="Privacy Policy | AI Project Board" />
        <meta property="og:description" content="Learn how AI Project Board protects your personal information." />
        <meta property="og:type" content="website" />
      </Helmet>

      <Header
        isLoggedIn={!!user}
        userName={username}
        onLogin={() => navigate("/auth")}
        onLogout={signOut}
        onNewProject={() => navigate("/")}
      />

      <main className="flex-1 container mx-auto px-4 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-4 text-muted-foreground">
              Last updated: January 2026
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Account information (email address, username, password)</li>
                  <li>Profile information (bio, avatar, social links)</li>
                  <li>Project information (title, description, screenshots, URLs)</li>
                  <li>Comments and interactions on the platform</li>
                  <li>Communications you send to us</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Provide, maintain, and improve the Service</li>
                  <li>Create and manage your account</li>
                  <li>Display your projects and profile to other users</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze usage patterns</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">3. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>With your consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>With service providers who assist in operating the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Public Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your profile, projects, and comments are public by default. Anyone can view 
                  this information without an account. Consider this when sharing information on 
                  the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate security measures to protect your personal information. 
                  However, no method of transmission over the Internet is completely secure. 
                  We cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Cookies and Analytics</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use essential cookies to maintain your session and preferences. We may use 
                  analytics tools to understand how users interact with the Service. You can 
                  control cookies through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">8. Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service may contain links to third-party websites. We are not responsible 
                  for the privacy practices of these sites. We encourage you to review their 
                  privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service is not intended for children under 13. We do not knowingly collect 
                  personal information from children under 13. If we learn we have collected 
                  such information, we will delete it.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">10. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of 
                  significant changes by posting a notice on the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">11. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:csells@sellsbrothers.com" className="text-primary hover:underline">
                    csells@sellsbrothers.com
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;