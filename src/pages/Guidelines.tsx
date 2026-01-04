import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Heart, Shield, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Guidelines = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Community Guidelines | AI Builders Community</title>
        <meta name="description" content="Our community guidelines for AI Builders. Learn how to be a great member of our community and what we expect from all participants." />
        <meta name="keywords" content="community guidelines, rules, AI Builders, code of conduct, community standards" />
        <link rel="canonical" href="https://aibuilders.community/guidelines" />
        <meta property="og:title" content="Community Guidelines | AI Builders Community" />
        <meta property="og:description" content="Learn how to be a great member of our AI Builders community." />
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
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground">
              Community Guidelines
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Our community thrives when everyone contributes positively. 
              These guidelines help us maintain a welcoming space for all AI builders.
            </p>
          </div>

          <div className="space-y-6">
            {/* Be Respectful */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Be Respectful</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Treat everyone with respect. We're all here to learn, share, and grow together. 
                      Constructive feedback is welcome; personal attacks are not.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Celebrate others' achievements</li>
                      <li>Offer helpful, constructive feedback</li>
                      <li>Acknowledge different skill levels and perspectives</li>
                      <li>Be patient with newcomers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Quality Projects */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Share Quality Projects</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      When sharing projects, provide accurate descriptions and ensure your work 
                      is something you're proud to show the community.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Write clear, accurate project descriptions</li>
                      <li>Include relevant screenshots that represent your project</li>
                      <li>Only share projects you have the right to share</li>
                      <li>Keep projects family-friendly and professional</li>
                      <li>Update projects to fix bugs or add improvements</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engage Constructively */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Engage Constructively</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Comments and feedback should help build up the community, not tear it down.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Ask questions to understand better</li>
                      <li>Share specific, actionable feedback</li>
                      <li>Acknowledge what works well, not just what could improve</li>
                      <li>Stay on topic in comments</li>
                      <li>Report issues rather than engaging with trolls</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Not Allowed */}
            <Card className="border-destructive/50">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">What's Not Allowed</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The following behaviors will result in content removal or account suspension:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Harassment, bullying, or discrimination of any kind</li>
                  <li>Spam, self-promotion unrelated to AI projects, or scams</li>
                  <li>Sharing others' work without permission or proper attribution</li>
                  <li>NSFW, violent, or illegal content</li>
                  <li>Malicious code or security exploits</li>
                  <li>Impersonating others</li>
                  <li>Doxxing or sharing private information</li>
                </ul>
              </CardContent>
            </Card>

            {/* Reporting */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-4">See Something? Say Something</h2>
                <p className="text-muted-foreground mb-6">
                  If you encounter content that violates these guidelines, please let us know. 
                  We review all reports and take appropriate action.
                </p>
                <Button asChild>
                  <a href="mailto:csells@sellsbrothers.com">
                    Report an Issue
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Guidelines;