import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckCircle, Edit3, AlertTriangle, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export type SignalCardProps = {
  id: string;
  title: string;
  summary: string;
  status: "unreviewed" | "confirmed" | "needs_edit";
  sourceTag?: string;
  confidence?: number;
  receiptsCount?: number;
  whySurfaced?: string;
  onConfirm: (id: string) => void;
  onNeedsEdit: (id: string) => void;
  className?: string;
};

export function SignalCard({
  id,
  title,
  summary,
  status,
  sourceTag,
  confidence,
  receiptsCount = 0,
  whySurfaced,
  onConfirm,
  onNeedsEdit,
  className
}: SignalCardProps) {
  const isUnreviewed = status === "unreviewed";
  const isConfirmed = status === "confirmed";
  const needsEdit = status === "needs_edit";
  
  const receiptsText = receiptsCount > 0 ? `${receiptsCount}/2` : "0/2";
  const needsProof = receiptsCount < 2;

  return (
    <Card 
      className={cn(
        "relative transition-all duration-200",
        // Purple glow for unreviewed
        isUnreviewed && "ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/10",
        // Amber border for needs edit
        needsEdit && "ring-2 ring-amber-400/50 border-amber-200",
        className
      )}
      data-signal-id={id}
    >
      {/* Status indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {sourceTag && (
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
            {sourceTag}
          </Badge>
        )}
        {isUnreviewed && (
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        )}
        {needsEdit && (
          <Badge variant="destructive" className="text-xs">
            Needs Edit
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="pr-20">
          <h3 className="font-semibold text-sm leading-tight">{title}</h3>
          {confidence && (
            <div className="mt-1 text-xs text-muted-foreground">
              Confidence: {Math.round(confidence * 100)}%
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>
        
        {whySurfaced && (
          <div className="mt-2 text-xs text-muted-foreground italic">
            {whySurfaced}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <Receipt className="h-3 w-3" />
            <span className={cn(
              needsProof && "text-amber-600"
            )}>
              {receiptsText}
            </span>
            {needsProof && (
              <Badge variant="outline" className="ml-1 text-xs text-amber-600 border-amber-300">
                Needs Proof
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          {isUnreviewed && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => onConfirm(id)}
                className="flex-1"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNeedsEdit(id)}
                className="flex-1"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Needs Edit
              </Button>
            </>
          )}
          {isConfirmed && (
            <Badge variant="default" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Confirmed
            </Badge>
          )}
          {needsEdit && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Review
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}