import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImagePlus, X } from "lucide-react";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (project: {
    title: string;
    description: string;
    screenshot?: string;
    repoUrl?: string;
    liveUrl?: string;
    lookingForContributors: boolean;
    tags: string[];
  }) => void;
}

export function ProjectForm({ open, onOpenChange, onSubmit }: ProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [lookingForContributors, setLookingForContributors] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSubmit({
      title,
      description,
      screenshot: screenshot || undefined,
      repoUrl: repoUrl || undefined,
      liveUrl: liveUrl || undefined,
      lookingForContributors,
      tags,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setScreenshot("");
    setRepoUrl("");
    setLiveUrl("");
    setLookingForContributors(false);
    setTagsInput("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Share Your Project</DialogTitle>
          <DialogDescription>
            Let the community know what you're building. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome AI Project"
              required
              className="bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your project does, what problem it solves, and any interesting technical details..."
              required
              rows={4}
              className="resize-none bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot URL</Label>
            <div className="flex gap-2">
              <Input
                id="screenshot"
                value={screenshot}
                onChange={(e) => setScreenshot(e.target.value)}
                placeholder="https://..."
                type="url"
                className="bg-secondary"
              />
              {screenshot && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setScreenshot("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {screenshot && (
              <div className="mt-2 aspect-video overflow-hidden rounded-lg border border-border bg-secondary">
                <img
                  src={screenshot}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={() => setScreenshot("")}
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Input
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                type="url"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liveUrl">Live Demo URL</Label>
              <Input
                id="liveUrl"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                className="bg-secondary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="AI, React, n8n, Agents..."
              className="bg-secondary"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="contributors" className="text-sm font-medium">
                Looking for Contributors?
              </Label>
              <p className="text-xs text-muted-foreground">
                Let others know you'd welcome help
              </p>
            </div>
            <Switch
              id="contributors"
              checked={lookingForContributors}
              onCheckedChange={setLookingForContributors}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow">
              Share Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
