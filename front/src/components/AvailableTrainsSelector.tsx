import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailedPricingResult } from "@/types/journey";
import { Calendar, Clock, Train } from "lucide-react";

interface AvailableTrainsSelectorProps {
  offers: DetailedPricingResult[];
  onTrainSelect: (trainName: string, departureDate: string) => void;
  selectedTrainName?: string;
  selectedDepartureDate?: string;
}

const AvailableTrainsSelector = ({
  offers,
  onTrainSelect,
  selectedTrainName,
  selectedDepartureDate,
}: AvailableTrainsSelectorProps) => {
  // Grouper les offres par train et date
  const groupedOffers = offers.reduce(
    (acc, offer) => {
      const key = `${offer.trainNumber}-${offer.departureDate}`;
      if (!acc[key]) {
        acc[key] = {
          trainNumber: offer.trainNumber,
          departureDate: offer.departureDate,
          departureTime: offer.departureTime,
          arrivalTime: offer.arrivalTime,
          offers: [],
        };
      }
      acc[key].offers.push(offer);
      return acc;
    },
    {} as Record<
      string,
      {
        trainNumber: string;
        departureDate: string;
        departureTime: string;
        arrivalTime: string;
        offers: DetailedPricingResult[];
      }
    >
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString("fr-FR", {
      weekday: "short",
    });
    const dateOnly = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
    return `${dayOfWeek} ${dateOnly}`;
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  const isSelected = (trainNumber: string, departureDate: string) => {
    return (
      selectedTrainName === trainNumber &&
      selectedDepartureDate === departureDate
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <Train className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Trains disponibles
            </CardTitle>
            <p className="text-sm text-gray-500">
              Sélectionnez un train pour voir les détails
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.values(groupedOffers).length === 0 ? (
          <div className="text-center py-8">
            <Train className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun train disponible</p>
          </div>
        ) : (
          Object.values(groupedOffers).map((group) => (
            <Button
              key={`${group.trainNumber}-${group.departureDate}`}
              variant={
                isSelected(group.trainNumber, group.departureDate)
                  ? "default"
                  : "outline"
              }
              className={`w-full justify-start p-4 h-auto ${
                isSelected(group.trainNumber, group.departureDate)
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "hover:bg-blue-50 hover:border-blue-300"
              }`}
              onClick={() =>
                onTrainSelect(group.trainNumber, group.departureDate)
              }
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4" />
                    <span className="font-semibold">
                      Train {group.trainNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(group.departureDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatTime(group.departureTime)} -{" "}
                        {formatTime(group.arrivalTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Button>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableTrainsSelector;
