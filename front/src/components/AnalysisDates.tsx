import { CalendarDays, Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";

interface AnalysisDatesProps {
  dates: string[];
  onDateSelect?: (date: string | null) => void;
  selectedDate?: string | null;
}

const AnalysisDates = ({
  dates,
  onDateSelect,
  selectedDate,
}: AnalysisDatesProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
    });
  };

  const sortedDates = [...dates].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getDateStatus = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "today";
    } else if (date > today) {
      return "future";
    } else {
      return "past";
    }
  };

  const handleDateClick = (date: string) => {
    if (onDateSelect) {
      onDateSelect(selectedDate === date ? null : date);
    }
  };

  return (
    <Card className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100/80 rounded-lg">
            <CalendarDays className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">
              Dates d'analyse disponibles
            </h3>
            <p className="text-xs text-gray-500">
              {sortedDates.length} jour(s) d'analyse dans la base de données
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sortedDates.map((date) => {
            const status = getDateStatus(date);
            const isSelected = selectedDate === date;

            const statusColors = {
              past: "bg-gray-100 text-gray-600 border-gray-200",
              today: "bg-green-100 text-green-700 border-green-300",
              future: "bg-blue-100 text-blue-700 border-blue-300",
            };

            const selectedColors = isSelected
              ? "bg-blue-500 text-white border-blue-600"
              : statusColors[status];

            return (
              <button
                key={date}
                onClick={() => handleDateClick(date)}
                className={`p-2 rounded-lg border text-xs font-medium transition-all hover:shadow-md ${selectedColors} ${
                  isSelected ? "ring-2 ring-blue-300" : ""
                }`}
                title={formatDate(date)}
              >
                <div className="text-center">
                  <div className="font-semibold">
                    {formatDate(date)} {formatDateShort(date)}
                  </div>
                  {status === "today" && (
                    <div className="text-xs bg-green-200 text-green-800 px-1 py-0.5 rounded mt-1">
                      Aujourd'hui
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Info className="w-3 h-3" />
              <span>Cliquez sur une date pour filtrer les données</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Passé</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Aujourd'hui</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Futur</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisDates;
