import { useCallback, useState } from "react";

export const useCollapsibleSection = (
  storageKey: string,
  defaultValue = true
) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : defaultValue;
  });

  const toggle = useCallback(() => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem(storageKey, JSON.stringify(newState));
  }, [isExpanded, storageKey]);

  return { isExpanded, toggle };
};

