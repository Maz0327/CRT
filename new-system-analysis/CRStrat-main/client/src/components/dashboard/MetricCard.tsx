import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  description?: string
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  description,
  className 
}: MetricCardProps) {
  const changeColors = {
    positive: "text-success",
    negative: "text-destructive", 
    neutral: "text-muted-foreground"
  }

  return (
    <Card className={cn(
      "bg-gradient-surface border-border/50 hover:border-primary/20 transition-smooth shadow-card hover:shadow-elevated",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-2 text-xs">
          {change && (
            <span className={changeColors[changeType]}>
              {change}
            </span>
          )}
          {description && (
            <span className="text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}