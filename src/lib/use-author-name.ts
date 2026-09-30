"use client";

import { useEffect, useState } from "react";
import { DEFAULT_AUTHOR_NAME, getAuthorName, getCachedAuthorNameSync } from "./posts-service";

/**
 * Yazar adını döndürür: önce önbellekten, ardından Firestore'dan tazelenir.
 */
export function useAuthorName(): string {
  const [name, setName] = useState(DEFAULT_AUTHOR_NAME);

  useEffect(() => {
    setName(getCachedAuthorNameSync());
    let alive = true;
    getAuthorName().then((n) => {
      if (alive) setName(n);
    });
    return () => {
      alive = false;
    };
  }, []);

  return name;
}
