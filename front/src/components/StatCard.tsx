import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange";
  description?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  description,
}: StatCardProps) => {
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
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm hover-lift">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm hover-lift">
      <div className="flex items-center gap-3">
        <div className={`p-2 ${classes.bg} rounded-lg`}>
          <Icon className={`w-5 h-5 ${classes.text}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
