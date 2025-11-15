import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildJourneyUrl } from "@/lib/utils";
import { GroupedJourney } from "@/types/journey";
import { trackJourneyClick } from "@/utils/matomoTracking";
import { Train } from "lucide-react";
import { Link } from "react-router-dom";
import { PriceDisplay } from "./PriceDisplay";

interface JourneyCardProps {
  journey: GroupedJourney;
  filteredPrices: {
    minPrice: number;
    avgPrice: number;
    maxPrice: number;
  };
}

const JourneyCard = ({ journey, filteredPrices }: JourneyCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Train className="h-5 w-5" />
          {journey.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <PriceDisplay
            minPrice={filteredPrices.minPrice}
            avgPrice={filteredPrices.avgPrice}
            maxPrice={filteredPrices.maxPrice}
          />

          <div className="text-sm text-muted-foreground">
            <span>
              {journey.offers.length} offre
              {journey.offers.length > 1 ? "s" : ""} disponible
              {journey.offers.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          asChild
          className="w-full"
          onClick={() =>
            trackJourneyClick(journey.departureStation, journey.arrivalStation)
          }
        >
          <Link
            to={buildJourneyUrl(
              journey.departureStation,
              journey.arrivalStation,
              journey.departureStationId,
              journey.arrivalStationId
            )}
          >
            Analyse détaillée
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JourneyCard;
