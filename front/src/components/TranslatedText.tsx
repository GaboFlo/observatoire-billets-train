import { translateTravelClass, translateDiscountCard, translateCarrier, translateTrainName } from "@/utils/translations";
import { TRANSLATION_CONFIG } from "@/utils/translationConfig";

interface TranslatedTextProps {
  value: string;
  type: 'travelClass' | 'discountCard' | 'carrier' | 'trainName';
  className?: string;
  showOriginal?: boolean;
}

const TranslatedText = ({ 
  value, 
  type, 
  className = "", 
  showOriginal = TRANSLATION_CONFIG.SHOW_ORIGINAL_IN_DEV 
}: TranslatedTextProps) => {
  let translatedValue: string;
  let isTranslated = false;

  switch (type) {
    case 'travelClass':
      translatedValue = translateTravelClass(value);
      isTranslated = translatedValue !== value;
      break;
    case 'discountCard':
      translatedValue = translateDiscountCard(value);
      isTranslated = translatedValue !== value;
      break;
    case 'carrier':
      translatedValue = translateCarrier(value);
      isTranslated = translatedValue !== value;
      break;
    case 'trainName':
      translatedValue = translateTrainName(value);
      isTranslated = translatedValue !== value;
      break;
    default:
      translatedValue = value;
      isTranslated = false;
  }

  // Si la valeur n'est pas traduite et qu'on veut afficher l'original
  if (!isTranslated && showOriginal) {
    return (
      <span className={`${className} ${TRANSLATION_CONFIG.ORIGINAL_STYLE}`} title={`Valeur originale: ${value}`}>
        {translatedValue}
      </span>
    );
  }

  // Si la valeur n'est pas traduite, on peut l'afficher avec un style différent
  if (!isTranslated) {
    return (
      <span className={`${className} ${TRANSLATION_CONFIG.FALLBACK_STYLE}`} title={`Valeur non traduite: ${value}`}>
        {translatedValue}
      </span>
    );
  }

  return <span className={className}>{translatedValue}</span>;
};

export default TranslatedText; 