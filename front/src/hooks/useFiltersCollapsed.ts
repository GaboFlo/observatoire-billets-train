import { useEffect, useState } from "react";

const STORAGE_KEY = "filters-collapsed";

export const useFiltersCollapsed = () => {
  const [filtersCollapsed, setFiltersCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      const newState = saved ? JSON.parse(saved) : false;
      if (newState !== filtersCollapsed) {
        setFiltersCollapsed(newState);
      }
    };
    globalThis.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 300);
    return () => {
      globalThis.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [filtersCollapsed]);

  const expandFilters = () => {
    const newState = false;
    setFiltersCollapsed(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  return { filtersCollapsed, expandFilters };
};

