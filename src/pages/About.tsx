import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Github, Twitter, Linkedin, ExternalLink, Sparkles, Heart, MessageSquare, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FeedbackDialog } from "@/components/FeedbackDialog";

const About = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split("@")[0];
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>About | AI Project Board</title>
        <meta name="description" content="Learn about AI Project Board, a platform inspired by Nate Jones and built by Chris Sells to showcase AI-powered projects." />
        <meta name="keywords" content="AI Project Board, community, about, Chris Sells, Nate Jones, AI projects" />
        <link rel="canonical" href="https://aiprojectboard.com/about" />
        <meta property="og:title" content="About | AI Project Board" />
        <meta property="og:description" content="Learn about AI Project Board, a platform inspired by Nate Jones and built by Chris Sells." />
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

        <div className="max-w-3xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
              About AI Builders
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              A community showcase for AI-powered projects built by creators around the world.
            </p>
          </div>

          {/* Inspiration Section */}
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">The Inspiration</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This project was inspired by{" "}
                    <a 
                      href="https://natesjokes.substack.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Nate Jones of Nate's Substack
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    , who created a space for showcasing creative AI projects. His vision of bringing 
                    together AI builders and their work sparked the idea for this community platform 
                    where creators can share, discover, and collaborate on AI-powered projects.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Builder Section */}
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">The Builder</h2>
              
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="shrink-0">
                  <img 
                    src="https://cdn.blot.im/blog_12688eba996c4a98b1ec3a945e78e4f1/_avatars/2daebd98-55ac-4462-b80d-a1bb7156ce67.jpg" 
                    alt="Chris Sells"
                    className="w-24 h-24 rounded-full object-cover border-2 border-border"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">Chris Sells</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Founder & Chief Proprietor, Sells Brothers, Inc.
                  </p>
                  
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Chris is a consultant in applied AI for developer tools, frameworks and ecosystems, 
                    as well as a Flutter fanatic. He's been building and writing about technology 
                    since 1995, sharing insights on everything from fun internet finds to interview 
                    tips to tools he's built.
                  </p>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    This site represents his personal views and opinions and was built as a 
                    passion project to help connect AI builders with their community.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://sellsbrothers.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Website
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://github.com/csells" target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://twitter.com/csells" target="_blank" rel="noopener noreferrer">
                        <Twitter className="mr-2 h-4 w-4" />
                        Twitter
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://linkedin.com/in/csells" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology Section */}
          <Card className="overflow-hidden">
            <CardContent className="p-8">
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
            </CardContent>
          </Card>

          {/* MCP Server Section */}
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">MCP Server</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Access AI Project Board data programmatically via our public MCP (Model Context Protocol) server. 
                    Query projects, profiles, and their connections using a standardized JSON-RPC interface.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Endpoint:</p>
                    <code className="text-sm text-foreground break-all">
                      https://aiprojectboard.com/functions/v1/mcp-server
                    </code>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Available tools: <span className="font-mono text-foreground">list_projects</span>, <span className="font-mono text-foreground">get_project</span>, <span className="font-mono text-foreground">search_projects</span>, <span className="font-mono text-foreground">get_profile</span>, <span className="font-mono text-foreground">list_profiles</span>, and more.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Learn about MCP
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-6">
                Have questions, suggestions, or want to connect? We'd love to hear from you.
              </p>
              <FeedbackDialog 
                open={feedbackOpen} 
                onOpenChange={setFeedbackOpen}
                trigger={
                  <Button onClick={() => setFeedbackOpen(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Chris
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;