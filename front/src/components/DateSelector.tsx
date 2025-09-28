import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface DateSelectorProps {
  availableDates: string[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const DateSelector = ({
  availableDates,
  selectedDate,
  onDateSelect,
}: DateSelectorProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString("fr-FR", {
      weekday: "long",
    });
    const dateOnly = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${dayOfWeek} ${dateOnly}`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Sélection de date
            </CardTitle>
            <p className="text-sm text-gray-500">
              Choisissez une date pour voir les trains disponibles
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {availableDates.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune date disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {availableDates.map((date) => (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                className={`w-full justify-start p-4 h-auto ${
                  selectedDate === date
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "hover:bg-blue-50 hover:border-blue-300"
                }`}
                onClick={() => onDateSelect(date)}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{formatDate(date)}</span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DateSelector;
