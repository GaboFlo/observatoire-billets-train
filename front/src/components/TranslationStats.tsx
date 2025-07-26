import { 
  travelClassTranslations, 
  discountCardTranslations, 
  carrierTranslations,
  trainNameTranslations 
} from "@/utils/translations";
import { GroupedJourney } from "@/types/journey";

interface TranslationStatsProps {
  journeys: GroupedJourney[];
  showMissing?: boolean;
}

const TranslationStats = ({ journeys, showMissing = false }: TranslationStatsProps) => {
  // Collecter toutes les valeurs uniques
  const allCarriers = new Set<string>();
  const allClasses = new Set<string>();
  const allDiscountCards = new Set<string>();
  const allTrainNames = new Set<string>();

  journeys.forEach(journey => {
    journey.carriers.forEach(carrier => allCarriers.add(carrier));
    journey.classes.forEach(cls => allClasses.add(cls));
    journey.discountCards.forEach(card => allDiscountCards.add(card));
    journey.offers.forEach(offer => allTrainNames.add(offer.trainName));
  });

  // Calculer les statistiques
  const carrierStats = {
    total: allCarriers.size,
    translated: Array.from(allCarriers).filter(carrier => carrierTranslations[carrier]).length,
    missing: Array.from(allCarriers).filter(carrier => !carrierTranslations[carrier])
  };

  const classStats = {
    total: allClasses.size,
    translated: Array.from(allClasses).filter(cls => travelClassTranslations[cls]).length,
    missing: Array.from(allClasses).filter(cls => !travelClassTranslations[cls])
  };

  const discountCardStats = {
    total: allDiscountCards.size,
    translated: Array.from(allDiscountCards).filter(card => discountCardTranslations[card]).length,
    missing: Array.from(allDiscountCards).filter(card => !discountCardTranslations[card])
  };

  const trainNameStats = {
    total: allTrainNames.size,
    translated: Array.from(allTrainNames).filter(name => trainNameTranslations[name]).length,
    missing: Array.from(allTrainNames).filter(name => !trainNameTranslations[name])
  };

  const getPercentage = (translated: number, total: number) => {
    return total > 0 ? Math.round((translated / total) * 100) : 0;
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Statistiques de Traduction</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-sm text-gray-700">Compagnies</h4>
          <p className="text-2xl font-bold text-blue-600">{carrierStats.translated}/{carrierStats.total}</p>
          <p className="text-xs text-gray-500">{getPercentage(carrierStats.translated, carrierStats.total)}% traduites</p>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-sm text-gray-700">Classes</h4>
          <p className="text-2xl font-bold text-green-600">{classStats.translated}/{classStats.total}</p>
          <p className="text-xs text-gray-500">{getPercentage(classStats.translated, classStats.total)}% traduites</p>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-sm text-gray-700">Cartes de réduction</h4>
          <p className="text-2xl font-bold text-purple-600">{discountCardStats.translated}/{discountCardStats.total}</p>
          <p className="text-xs text-gray-500">{getPercentage(discountCardStats.translated, discountCardStats.total)}% traduites</p>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-sm text-gray-700">Noms de trains</h4>
          <p className="text-2xl font-bold text-orange-600">{trainNameStats.translated}/{trainNameStats.total}</p>
          <p className="text-xs text-gray-500">{getPercentage(trainNameStats.translated, trainNameStats.total)}% traduites</p>
        </div>
      </div>

      {showMissing && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Traductions manquantes :</h4>
          
          {carrierStats.missing.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-blue-700">Compagnies :</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {carrierStats.missing.map(carrier => (
                  <span key={carrier} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {carrier}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {classStats.missing.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-green-700">Classes</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {classStats.missing.map(cls => (
                  <span key={cls} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {discountCardStats.missing.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-purple-700">Cartes de réduction :</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {discountCardStats.missing.map(card => (
                  <span key={card} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {card}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {trainNameStats.missing.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-orange-700">Noms de trains :</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {trainNameStats.missing.map(name => (
                  <span key={name} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslationStats; 