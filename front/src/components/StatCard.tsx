import { LucideIcon } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange" | "red";
  description?: string;
  tooltipText?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  description,
  tooltipText,
}: StatCardProps) => {
  const isMobile = useIsMobile();
  const colorClasses = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      iconBg: "bg-blue-500",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      iconBg: "bg-green-500",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      iconBg: "bg-purple-500",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      iconBg: "bg-orange-500",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
      iconBg: "bg-red-500",
    },
  };

  // Vérification robuste pour éviter l'erreur undefined
  const validColor =
    color && typeof color === "string" && colorClasses[color] ? color : "blue";
  const classes = colorClasses[validColor];

  // Vérification supplémentaire pour s'assurer que classes existe
  if (!classes) {
    console.warn(
      `Couleur invalide pour StatCard: ${color}, utilisation du bleu par défaut`
    );
    const fallbackCardContent = (
      <div className={`bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover-lift ${isMobile ? "p-3" : "p-6"}`}>
        <div className={`flex items-center ${isMobile ? "gap-2" : "gap-3"}`}>
          <div className={`${isMobile ? "p-1.5" : "p-2"} bg-blue-100 rounded-lg`}>
            <Icon className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-blue-600`} />
          </div>
          <div className="flex-1">
            <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-gray-600`}>{title}</p>
            <p className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-gray-900`}>{value}</p>
            {description && (
              <p className={`${isMobile ? "text-[10px]" : "text-xs"} text-gray-500 ${isMobile ? "mt-0.5" : "mt-1"}`}>{description}</p>
            )}
          </div>
        </div>
      </div>
    );

    if (tooltipText) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{fallbackCardContent}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return fallbackCardContent;
  }

  const cardContent = (
    <div className={`bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover-lift ${isMobile ? "p-3" : "p-6"}`}>
      <div className={`flex items-center ${isMobile ? "gap-2" : "gap-3"}`}>
        <div className={`${isMobile ? "p-1.5" : "p-2"} ${classes.bg} rounded-lg`}>
          <Icon className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} ${classes.text}`} />
        </div>
        <div className="flex-1">
          <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-gray-600`}>{title}</p>
          <p className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-gray-900`}>{value}</p>
          {description && (
            <p className={`${isMobile ? "text-[10px]" : "text-xs"} text-gray-500 ${isMobile ? "mt-0.5" : "mt-1"}`}>{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (tooltipText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{cardContent}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
};

export default StatCard;
