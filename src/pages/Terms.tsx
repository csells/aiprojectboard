import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Terms = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Terms of Service | AI Project Board</title>
        <meta name="description" content="Read the Terms of Service for AI Project Board. Understand your rights and responsibilities when using our platform." />
        <meta name="keywords" content="terms of service, legal, AI Project Board, user agreement" />
        <link rel="canonical" href="https://aiprojectboard.com/terms" />
        <meta property="og:title" content="Terms of Service | AI Project Board" />
        <meta property="og:description" content="Read the Terms of Service for AI Project Board." />
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground">
              Terms of Service
            </h1>
            <p className="mt-4 text-muted-foreground">
              Last updated: January 2026
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using AI Project Board ("the Service"), you agree to be bound by these 
                  Terms of Service. If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  AI Project Board is a platform for sharing and discovering AI-powered projects. 
                  Users can create accounts, submit projects, interact with other users' projects through 
                  likes and comments, and maintain a public profile.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials 
                  and for all activities that occur under your account. You must provide accurate and 
                  complete information when creating an account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. User Content</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You retain ownership of content you submit to the Service. By submitting content, 
                  you grant us a non-exclusive, worldwide, royalty-free license to use, display, and 
                  distribute your content in connection with the Service.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You are solely responsible for the content you submit and must ensure it does not 
                  violate any laws or the rights of others.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Prohibited Conduct</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Submit content that is illegal, harmful, or violates others' rights</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Use the Service for any unlawful purpose</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service and its original content (excluding user content) are protected by 
                  copyright, trademark, and other laws. You may not copy, modify, or distribute 
                  any part of the Service without our written permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground leading-relaxed">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
                  OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE. 
                  NO WARRANTIES ARE EXTENDED OR IMPLIED.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF 
                  THE SERVICE.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">9. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your access to the Service at any 
                  time, with or without cause, and with or without notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">10. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may modify these Terms at any time. Continued use of the Service after changes 
                  constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">11. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms, please contact us at{" "}
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

export default Terms;