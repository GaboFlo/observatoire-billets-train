
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string | number;
  icon?: ReactNode;
  className?: string;
}

const StatCard = ({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  className,
}: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        {trend && trendValue && (
          <div className="flex items-center mt-4">
            {trend === 'up' ? (
              <TrendingUp 
                className="mr-1 h-4 w-4 text-emerald-500" 
                aria-hidden="true" 
              />
            ) : trend === 'down' ? (
              <TrendingDown 
                className="mr-1 h-4 w-4 text-red-500" 
                aria-hidden="true" 
              />
            ) : null}
            <span 
              className={cn(
                "text-xs font-medium",
                trend === 'up' ? "text-emerald-500" : 
                trend === 'down' ? "text-red-500" : 
                "text-gray-500"
              )}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
