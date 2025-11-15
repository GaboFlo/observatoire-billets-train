import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translateCarrier } from "@/utils/translations";
import { Clock, Train } from "lucide-react";

interface TrainInfo {
  trainNumber: string;
  departureTime: string;
  arrivalTime: string;
  carrier: string;
  minPrice: number;
}

interface TrainsForDateSelectorProps {
  trains: TrainInfo[];
  selectedTrain: string | null;
  onTrainSelect: (trainNumber: string) => void;
}

const TrainsForDateSelector = ({
  trains,
  selectedTrain,
  onTrainSelect,
}: TrainsForDateSelectorProps) => {
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
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
        {trains.length === 0 ? (
          <div className="text-center py-8">
            <Train className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              Aucun train disponible pour cette date
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {trains.map((train) => (
              <Button
                key={train.trainNumber}
                variant={
                  selectedTrain === train.trainNumber ? "default" : "outline"
                }
                className={`w-full justify-start p-4 h-auto ${
                  selectedTrain === train.trainNumber
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "hover:bg-green-50 hover:border-green-300"
                }`}
                onClick={() => onTrainSelect(train.trainNumber)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Train className="w-4 h-4" />
                      <span className="font-semibold">
                        Train {train.trainNumber}
                      </span>
                      <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {translateCarrier(train.carrier)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatTime(train.departureTime)} -{" "}
                        {formatTime(train.arrivalTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainsForDateSelector;
