import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share, ExternalLink, TrendingUp } from "lucide-react"

interface SignalCardProps {
  title: string
  content: string
  platform: "reddit" | "twitter" | "instagram" | "tiktok" | "youtube"
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  viralScore: number
  tags: string[]
  timestamp: string
  author: string
  url?: string
}

const platformColors = {
  reddit: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  twitter: "bg-blue-500/10 text-blue-400 border-blue-500/20", 
  instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  tiktok: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  youtube: "bg-red-500/10 text-red-400 border-red-500/20"
}

const getViralScoreColor = (score: number) => {
  if (score >= 80) return "text-success border-success/20"
  if (score >= 60) return "text-warning border-warning/20"
  return "text-muted-foreground border-border"
}

export function SignalCard({ 
  title, 
  content, 
  platform, 
  engagement, 
  viralScore, 
  tags, 
  timestamp, 
  author,
  url 
}: SignalCardProps) {
  return (
    <Card className="bg-gradient-surface border-border/50 hover:border-primary/20 transition-smooth shadow-card hover:shadow-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge className={platformColors[platform]} variant="outline">
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getViralScoreColor(viralScore)} font-medium`}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {viralScore}% Viral Score
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground line-clamp-2">
              {title}
            </h3>
          </div>
          {url && (
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {content}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{engagement.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{engagement.comments.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share className="w-4 h-4" />
              <span>{engagement.shares.toLocaleString()}</span>
            </div>
          </div>
          <span>{timestamp}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          by @{author}
        </div>
      </CardContent>
    </Card>
  )
}