import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface FilterCollapseButtonProps {
  onExpand: () => void;
}

const FilterCollapseButton = ({
  onExpand,
}: FilterCollapseButtonProps) => {
  return (
    <Button
      onClick={onExpand}
      variant="outline"
      size="sm"
      className="fixed left-0 top-1/2 -translate-y-1/2 z-40 rounded-r-lg rounded-l-none shadow-lg bg-white hover:bg-gray-50"
      aria-label="Afficher les filtres"
    >
      <ChevronRight className="w-4 h-4" />
    </Button>
  );
};

export default FilterCollapseButton;

