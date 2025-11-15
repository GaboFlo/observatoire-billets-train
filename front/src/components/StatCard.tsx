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

const COLOR_CLASSES = {
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
} as const;

const getMobileClass = (
  mobile: string,
  desktop: string,
  isMobile: boolean
): string => {
  return isMobile ? mobile : desktop;
};

const getColorClasses = (color: string) => {
  return (
    COLOR_CLASSES[color as keyof typeof COLOR_CLASSES] || COLOR_CLASSES.blue
  );
};

const renderCardContent = (
  title: string,
  value: string | number,
  Icon: LucideIcon,
  colorClasses: (typeof COLOR_CLASSES)[keyof typeof COLOR_CLASSES],
  description: string | undefined,
  isMobile: boolean
) => {
  const containerPadding = getMobileClass("p-3", "p-6", isMobile);
  const gap = getMobileClass("gap-2", "gap-3", isMobile);
  const iconPadding = getMobileClass("p-1.5", "p-2", isMobile);
  const iconSize = getMobileClass("w-4 h-4", "w-5 h-5", isMobile);
  const titleSize = getMobileClass("text-xs", "text-sm", isMobile);
  const valueSize = getMobileClass("text-xl", "text-2xl", isMobile);
  const descriptionSize = getMobileClass("text-[10px]", "text-xs", isMobile);
  const descriptionMargin = getMobileClass("mt-0.5", "mt-1", isMobile);

  return (
    <div
      className={`bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover-lift ${containerPadding}`}
    >
      <div className={`flex items-center ${gap}`}>
        <div className={`${iconPadding} ${colorClasses.bg} rounded-lg`}>
          <Icon className={`${iconSize} ${colorClasses.text}`} />
        </div>
        <div className="flex-1">
          <p className={`${titleSize} font-medium text-gray-600`}>{title}</p>
          <p className={`${valueSize} font-bold text-gray-900`}>{value}</p>
          {description && (
            <p
              className={`${descriptionSize} text-gray-500 ${descriptionMargin}`}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const wrapWithTooltip = (content: JSX.Element, tooltipText: string) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help">{content}</div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  description,
  tooltipText,
}: StatCardProps) => {
  const isMobile = useIsMobile();
  const colorClasses = getColorClasses(color);

  const cardContent = renderCardContent(
    title,
    value,
    Icon,
    colorClasses,
    description,
    isMobile
  );

  return tooltipText ? wrapWithTooltip(cardContent, tooltipText) : cardContent;
};

export default StatCard;
