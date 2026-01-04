import { useState, useEffect } from "react";
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
import { X } from "lucide-react";
import { Project } from "@/hooks/useProjects";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (projectId: string, data: {
    title: string;
    description: string;
    screenshot?: string;
    repoUrl?: string;
    liveUrl?: string;
    lookingForContributors: boolean;
    tags: string[];
  }) => void;
}

export function EditProjectDialog({ project, open, onOpenChange, onSubmit }: EditProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [lookingForContributors, setLookingForContributors] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  // Populate form when project changes
  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || "");
      setScreenshot(project.screenshot || "");
      setRepoUrl(project.repoUrl || "");
      setLiveUrl(project.liveUrl || "");
      setLookingForContributors(project.lookingForContributors);
      setTagsInput(project.tags.join(", "));
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSubmit(project.id, {
      title,
      description,
      screenshot: screenshot || undefined,
      repoUrl: repoUrl || undefined,
      liveUrl: liveUrl || undefined,
      lookingForContributors,
      tags,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Edit Project</DialogTitle>
          <DialogDescription>
            Update your project details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Project Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome AI Project"
              required
              className="bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your project does..."
              required
              rows={4}
              className="resize-none bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-screenshot">Screenshot URL</Label>
            <div className="flex gap-2">
              <Input
                id="edit-screenshot"
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
              <Label htmlFor="edit-repoUrl">Repository URL</Label>
              <Input
                id="edit-repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                type="url"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-liveUrl">Live Demo URL</Label>
              <Input
                id="edit-liveUrl"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                className="bg-secondary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
            <Input
              id="edit-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="AI, React, n8n, Agents..."
              className="bg-secondary"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="edit-contributors" className="text-sm font-medium">
                Looking for Contributors?
              </Label>
              <p className="text-xs text-muted-foreground">
                Let others know you'd welcome help
              </p>
            </div>
            <Switch
              id="edit-contributors"
              checked={lookingForContributors}
              onCheckedChange={setLookingForContributors}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
