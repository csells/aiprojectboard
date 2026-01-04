import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImagePlus, Loader2, Upload, X, Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScreenshotUploadProps {
  value: string;
  onChange: (url: string) => void;
  userId?: string;
}

export function ScreenshotUpload({ value, onChange, userId }: ScreenshotUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userId) {
      toast.error("Please sign in to upload screenshots");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("screenshots")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("screenshots")
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success("Screenshot uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
  };

  return (
    <div className="space-y-2">
      <Label>Screenshot</Label>
      
      {value ? (
        <div className="space-y-2">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-secondary">
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={() => {
                toast.error("Failed to load image");
                onChange("");
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url">
              <Link2 className="mr-2 h-4 w-4" />
              URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-3">
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 p-8 transition-colors hover:border-primary/50 hover:bg-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="mt-3">
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/screenshot.png"
                type="url"
                className="bg-secondary"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
              >
                Add
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
