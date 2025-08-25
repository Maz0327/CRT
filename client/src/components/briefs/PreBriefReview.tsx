import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";

interface Capture {
  id: string;
  title: string;
  summary?: string;
  ai_analysis?: {
    summary?: string;
    key_insights?: string[];
  };
  metadata?: {
    image_url?: string;
  };
}

interface PreBriefReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  captures: Capture[];
  onConfirm: (options: { title: string; outline: SlideOutline[] }) => void;
  onCancel: () => void;
}

interface SlideOutline {
  title: string;
  bullets: string[];
  imageUrl?: string;
  slideNumber: number;
}

export function PreBriefReview({ open, onOpenChange, captures, onConfirm, onCancel }: PreBriefReviewProps) {
  const [briefTitle, setBriefTitle] = useState("");

  // Generate slide outline from captures
  const generateOutline = (): SlideOutline[] => {
    const outline: SlideOutline[] = [
      {
        title: briefTitle || "Strategic Intelligence Brief",
        bullets: ["Executive Summary", "Key Findings", "Strategic Recommendations"],
        slideNumber: 1
      }
    ];

    captures.forEach((capture, index) => {
      const bullets = [];
      
      // Add summary if available
      if (capture.ai_analysis?.summary) {
        bullets.push(capture.ai_analysis.summary);
      } else if (capture.summary) {
        bullets.push(capture.summary);
      }
      
      // Add key insights
      if (capture.ai_analysis?.key_insights) {
        bullets.push(...capture.ai_analysis.key_insights.slice(0, 2));
      }

      // Fallback if no content
      if (bullets.length === 0) {
        bullets.push("Key findings from analysis");
        bullets.push("Strategic implications");
      }

      outline.push({
        title: capture.title || `Signal ${index + 1}`,
        bullets: bullets.slice(0, 3), // Limit to 3 bullets per slide
        imageUrl: capture.metadata?.image_url,
        slideNumber: index + 2
      });
    });

    return outline;
  };

  const outline = generateOutline();

  const handleConfirm = () => {
    if (!briefTitle.trim()) {
      return;
    }
    onConfirm({
      title: briefTitle,
      outline
    });
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Brief Preview</DialogTitle>
          <DialogDescription>
            Review the slide structure before exporting to Google Slides
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Brief Title Input */}
          <div className="space-y-2">
            <Label htmlFor="briefTitle">Brief Title</Label>
            <Input
              id="briefTitle"
              placeholder="Enter brief title..."
              value={briefTitle}
              onChange={(e) => setBriefTitle(e.target.value)}
            />
          </div>

          {/* Slide Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Slide Outline</h3>
              <Badge variant="secondary">{outline.length} slides</Badge>
            </div>

            <div className="grid gap-4">
              {outline.map((slide, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Slide {slide.slideNumber}: {slide.title}
                      </CardTitle>
                      {slide.imageUrl && (
                        <Badge variant="outline">📷 Image</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {slide.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{captures.length}</div>
              <div className="text-sm text-muted-foreground">Captures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{outline.length}</div>
              <div className="text-sm text-muted-foreground">Slides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {outline.filter(s => s.imageUrl).length}
              </div>
              <div className="text-sm text-muted-foreground">Images</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!briefTitle.trim()}
          >
            Export to Google Slides
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}