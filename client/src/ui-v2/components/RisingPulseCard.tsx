import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Flame, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export type RisingPulseCardProps = {
  id: string;
  term: string;
  rationale: string | null;
  receiptsCount: number;
  confidence: number | null;
  onClick?: (id: string) => void;
  className?: string;
};

export function RisingPulseCard({
  id,
  term,
  rationale,
  receiptsCount = 0,
  confidence,
  onClick,
  className
}: RisingPulseCardProps) {
  const handleClick = () => {
    onClick?.(id);
  };

  return (
    <Card 
      className={cn(
        "relative transition-all duration-200 cursor-pointer hover:shadow-md hover:ring-2 hover:ring-orange-500/20",
        "border-orange-200/50 shadow-sm shadow-orange-500/10",
        className
      )}
      onClick={handleClick}
      data-rising-pulse-id={id}
    >
      {/* Status indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {confidence && (
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
            {Math.round(confidence * 100)}%
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="pr-20">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <h3 className="font-bold text-sm leading-tight text-orange-900">{term}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {rationale && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {rationale}
          </p>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <Receipt className="h-3 w-3 text-muted-foreground" />
            <Badge 
              variant="outline" 
              className={cn(
                "px-2 py-0.5 text-xs font-medium",
                receiptsCount > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600"
              )}
            >
              {receiptsCount} receipt{receiptsCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}