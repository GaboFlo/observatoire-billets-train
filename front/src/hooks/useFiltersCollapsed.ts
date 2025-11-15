import { useEffect, useState } from "react";

const STORAGE_KEY = "filters-collapsed";
const MOBILE_STORAGE_KEY = "filters-collapsed-mobile";
const DESKTOP_STORAGE_KEY = "filters-collapsed-desktop";
const MOBILE_BREAKPOINT = 768;

export const getFiltersCollapsedInitialState = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  const isMobileDevice = window.innerWidth < MOBILE_BREAKPOINT;
  const storageKey = isMobileDevice ? MOBILE_STORAGE_KEY : DESKTOP_STORAGE_KEY;
  const saved = localStorage.getItem(storageKey);
  if (saved !== null) {
    return JSON.parse(saved);
  }
  return isMobileDevice;
};

const getInitialState = getFiltersCollapsedInitialState;

export const useFiltersCollapsed = () => {
  const [filtersCollapsed, setFiltersCollapsed] = useState(getInitialState);

  useEffect(() => {
    const handleStorageChange = () => {
      const newState = getInitialState();
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
    const isMobileDevice =
      typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
    const storageKey = isMobileDevice
      ? MOBILE_STORAGE_KEY
      : DESKTOP_STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(newState));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

    if (isMobileDevice) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  return { filtersCollapsed, expandFilters };
};
