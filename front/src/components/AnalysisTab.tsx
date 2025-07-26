import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { GroupedJourney } from "@/types/journey";

interface AnalysisTabProps {
  journeys: GroupedJourney[];
}

const AnalysisTab = ({ journeys }: AnalysisTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse des Prix par Jour de Départ</CardTitle>
        <CardDescription>
          Prix moyen en fonction du nombre de jours avant le départ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Sélectionnez un trajet pour voir l'évolution des prix selon J-X
        </p>
        <div className="space-y-4">
          {journeys.map((journey) => (
            <Button
              key={journey.id}
              variant="outline"
              asChild
              className="w-full justify-start"
            >
              <Link to={`/journey/${journey.id}`}>
                <div className="text-left">
                  <p className="font-medium">{journey.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {journey.departureStation} → {journey.arrivalStation}
                  </p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisTab; 