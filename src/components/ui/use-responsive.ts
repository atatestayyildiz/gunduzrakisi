"use client";

import { useEffect, useState } from "react";

type ResponsiveProp<T> = {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
} | T;

export function useResponsive<T>(prop: ResponsiveProp<T> | undefined, defaultValue: T = 196 as unknown as T): T {
  const [currentValue, setCurrentValue] = useState<T>(() => {
    if (typeof prop === "object" && prop !== null && !Array.isArray(prop)) {
      const obj = prop as { sm?: T; md?: T; lg?: T; xl?: T };
      return obj.lg ?? obj.md ?? obj.sm ?? defaultValue;
    }
    return prop !== undefined ? prop : defaultValue;
  });

  useEffect(() => {
    if (typeof prop !== "object" || prop === null || Array.isArray(prop)) {
      if (prop !== undefined) setCurrentValue(prop);
      return;
    }

    const obj = prop as { sm?: T; md?: T; lg?: T; xl?: T };

    const updateMatch = () => {
      const w = window.innerWidth;
      if (w >= 1280 && obj.xl !== undefined) setCurrentValue(obj.xl);
      else if (w >= 1024 && obj.lg !== undefined) setCurrentValue(obj.lg);
      else if (w >= 768 && obj.md !== undefined) setCurrentValue(obj.md);
      else if (obj.sm !== undefined) setCurrentValue(obj.sm);
      else setCurrentValue(defaultValue);
    };

    updateMatch();
    window.addEventListener("resize", updateMatch);
    return () => window.removeEventListener("resize", updateMatch);
  }, [prop, defaultValue]);

  return currentValue;
}
