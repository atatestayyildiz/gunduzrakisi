"use client";

import { db, isFirebaseConfigured } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  query,
  orderBy
} from "firebase/firestore";
import { BookArticle, CategoryItem, MusicTrack } from "./types";
import { INITIAL_ARTICLES, INITIAL_CATEGORIES } from "./initial-data";

const LOCAL_STORAGE_ARTICLES_KEY = "gunduz_rakisi_articles_v5";
const LOCAL_STORAGE_CATEGORIES_KEY = "gunduz_rakisi_categories_v5";
const LOCAL_STORAGE_MUSIC_KEY = "gunduz_rakisi_music_tracks_v1";

let memoryArticlesCache: BookArticle[] | null = null;
let memoryCategoriesCache: CategoryItem[] | null = null;
let memoryTracksCache: MusicTrack[] | null = null;

/**
 * Wraps a promise with a timeout so mobile cellular networks never hang indefinitely.
 */
function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Synchronous local cache reader for zero-delay initial render on mobile.
 */
export function getCachedArticlesSync(): BookArticle[] {
  if (memoryArticlesCache && memoryArticlesCache.length > 0) {
    return memoryArticlesCache;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BookArticle[];
        if (parsed && parsed.length > 0) {
          const sorted = parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          memoryArticlesCache = sorted;
          return sorted;
        }
      }
    } catch {}
  }
  return [];
}

export function getCachedCategoriesSync(): CategoryItem[] {
  if (memoryCategoriesCache && memoryCategoriesCache.length > 0) {
    return memoryCategoriesCache;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CategoryItem[];
        if (parsed && parsed.length > 0) {
          memoryCategoriesCache = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  return INITIAL_CATEGORIES;
}

/**
 * Strips all undefined fields from an object so Firestore setDoc does not throw errors.
 */
export function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Gets all articles sorted by order.
 */
export async function getArticles(): Promise<BookArticle[]> {
  // 1. Try Firestore with timeout if configured
  if (isFirebaseConfigured && db) {
    try {
      const snap = await withTimeout(getDocs(collection(db, "articles")), 2500);
      if (!snap.empty) {
        const list: BookArticle[] = [];
        snap.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as BookArticle);
        });
        const sorted = list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        memoryArticlesCache = sorted;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(sorted));
          } catch {}
        }
        return sorted;
      } else {
        // If Firestore is empty, check if LocalStorage has existing articles to migrate
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
          if (stored) {
            const localList = JSON.parse(stored) as BookArticle[];
            if (localList && localList.length > 0) {
              for (const a of localList) {
                try {
                  await setDoc(doc(db, "articles", a.id), cleanForFirestore(a));
                } catch (mErr) {
                  console.warn("Auto-migration article item failed:", mErr);
                }
              }
              const sorted = localList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              memoryArticlesCache = sorted;
              return sorted;
            }
          }
        }
      }
    } catch (err) {
      console.warn("Firestore fetch failed/timeout, falling back to cache:", err);
    }
  }

  // 2. Try In-Memory Cache
  if (memoryArticlesCache && memoryArticlesCache.length > 0) {
    return memoryArticlesCache;
  }

  // 3. Try LocalStorage
  if (typeof window !== "undefined") {
    try {
      // Clean up any legacy mock stores
      localStorage.removeItem("gunduz_rakisi_articles_v1");
      localStorage.removeItem("gunduz_rakisi_articles_v2");
      localStorage.removeItem("gunduz_rakisi_articles_v3");
      localStorage.removeItem("gunduz_rakisi_articles_v4");

      const stored = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BookArticle[];
        if (parsed && parsed.length > 0) {
          const sorted = parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          memoryArticlesCache = sorted;
          return sorted;
        }
      }
    } catch (e) {
      console.warn("Local storage read error:", e);
    }
  }

  // 4. Fallback to initial seed articles
  return INITIAL_ARTICLES.sort((a, b) => a.order - b.order);
}

/**
 * Saves or updates an article.
 */
export async function saveArticle(article: BookArticle): Promise<void> {
  const cleaned = cleanForFirestore(article);

  // Update Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "articles", article.id), cleaned);
    } catch (err) {
      console.error("Firestore save error:", err);
      throw err;
    }
  }

  // Update LocalStorage and In-Memory Cache
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
      const currentList = stored ? (JSON.parse(stored) as BookArticle[]) : (memoryArticlesCache || []);
      const index = currentList.findIndex((a) => a.id === article.id);
      let updated: BookArticle[];
      if (index >= 0) {
        updated = [...currentList];
        updated[index] = article;
      } else {
        updated = [article, ...currentList];
      }
      memoryArticlesCache = updated;
      localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage save error:", e);
    }
  } else if (memoryArticlesCache) {
    const index = memoryArticlesCache.findIndex((a) => a.id === article.id);
    if (index >= 0) {
      memoryArticlesCache[index] = article;
    } else {
      memoryArticlesCache = [article, ...memoryArticlesCache];
    }
  }
}

/**
 * Toggles like for an article and returns the new like count.
 */
export async function toggleArticleLike(articleId: string, shouldLike: boolean): Promise<number> {
  let newLikes = 0;
  const delta = shouldLike ? 1 : -1;

  // 1. Update LocalStorage and In-Memory Cache first for instant responsiveness
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
      if (stored) {
        const currentList = JSON.parse(stored) as BookArticle[];
        const idx = currentList.findIndex((a) => a.id === articleId);
        if (idx >= 0) {
          const currentLikes = currentList[idx].likes || 0;
          newLikes = Math.max(0, currentLikes + delta);
          currentList[idx].likes = newLikes;
          memoryArticlesCache = currentList;
          localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(currentList));
        }
      }
    } catch (e) {
      console.error("Local storage like update error:", e);
    }
  }

  if (memoryArticlesCache) {
    const idx = memoryArticlesCache.findIndex((a) => a.id === articleId);
    if (idx >= 0) {
      const cur = memoryArticlesCache[idx].likes || 0;
      newLikes = Math.max(0, cur + delta);
      memoryArticlesCache[idx].likes = newLikes;
    }
  }

  // 2. Sync with Firestore
  if (isFirebaseConfigured && db) {
    try {
      const artRef = doc(db, "articles", articleId);
      await updateDoc(artRef, {
        likes: increment(delta),
      });
    } catch (err) {
      console.error("Firestore toggleArticleLike error:", err);
    }
  }

  return newLikes;
}

/**
 * Increments view count for an article after reader spends >5s.
 */
export async function incrementArticleViews(articleId: string): Promise<number> {
  let newViews = 0;

  // 1. Update LocalStorage and In-Memory Cache
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
      if (stored) {
        const currentList = JSON.parse(stored) as BookArticle[];
        const idx = currentList.findIndex((a) => a.id === articleId);
        if (idx >= 0) {
          const currentViews = currentList[idx].views || 0;
          newViews = currentViews + 1;
          currentList[idx].views = newViews;
          memoryArticlesCache = currentList;
          localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(currentList));
        }
      }
    } catch (e) {
      console.error("Local storage view update error:", e);
    }
  }

  if (memoryArticlesCache) {
    const idx = memoryArticlesCache.findIndex((a) => a.id === articleId);
    if (idx >= 0) {
      newViews = (memoryArticlesCache[idx].views || 0) + 1;
      memoryArticlesCache[idx].views = newViews;
    }
  }

  // 2. Sync with Firestore
  if (isFirebaseConfigured && db) {
    try {
      const artRef = doc(db, "articles", articleId);
      await updateDoc(artRef, {
        views: increment(1),
      });
    } catch (err) {
      console.error("Firestore incrementArticleViews error:", err);
    }
  }

  return newViews;
}

/**
 * Deletes an article by ID.
 */
export async function deleteArticle(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "articles", id));
    } catch (err) {
      console.error("Firestore delete error:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
      const currentList = stored ? (JSON.parse(stored) as BookArticle[]) : [];
      const updated = currentList.filter((a) => a.id !== id);
      memoryArticlesCache = updated;
      localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage delete error:", e);
    }
  } else if (memoryArticlesCache) {
    memoryArticlesCache = memoryArticlesCache.filter((a) => a.id !== id);
  }
}

/**
 * Saves a new custom shelf order of articles.
 */
export async function saveArticlesOrder(orderedArticles: BookArticle[]): Promise<void> {
  const updated = orderedArticles.map((item, idx) => ({
    ...item,
    order: idx
  }));

  memoryArticlesCache = updated;

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(updated));
  }

  if (isFirebaseConfigured && db) {
    for (const item of updated) {
      try {
        await setDoc(doc(db, "articles", item.id), cleanForFirestore(item), { merge: true });
      } catch (err) {
        console.error("Firestore order save error:", err);
      }
    }
  }
}

/**
 * Gets all categories.
 */
export async function getCategories(): Promise<CategoryItem[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await withTimeout(getDocs(collection(db, "categories")), 2500);
      if (!snap.empty) {
        const list: CategoryItem[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as CategoryItem));
        memoryCategoriesCache = list;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(list));
          } catch {}
        }
        return list;
      } else {
        // If Firestore categories is empty, check if user has local categories or seed with initial
        let toSeed = INITIAL_CATEGORIES;
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
          if (stored) {
            const localCats = JSON.parse(stored) as CategoryItem[];
            if (localCats && localCats.length > 0) {
              toSeed = localCats;
            }
          }
        }
        for (const cat of toSeed) {
          try {
            await setDoc(doc(db, "categories", cat.id), cat);
          } catch {}
        }
        memoryCategoriesCache = toSeed;
        return toSeed;
      }
    } catch (err) {
      console.warn("Firestore categories read error/timeout:", err);
    }
  }

  if (memoryCategoriesCache && memoryCategoriesCache.length > 0) {
    return memoryCategoriesCache;
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CategoryItem[];
        if (parsed && parsed.length > 0) {
          memoryCategoriesCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Categories read error:", e);
    }
  }
  return INITIAL_CATEGORIES;
}

/**
 * Adds or saves a new category.
 */
export async function saveCategory(category: CategoryItem): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "categories", category.id), cleanForFirestore(category));
    } catch (err) {
      console.error("Firestore category save error:", err);
    }
  }

  if (typeof window !== "undefined") {
    const categories = await getCategories();
    if (!categories.find((c) => c.id === category.id)) {
      const updated = [...categories, category];
      memoryCategoriesCache = updated;
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(updated));
    }
  }
}

/**
 * Updates an existing category name.
 */
export async function updateCategory(id: string, newName: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "categories", id), { name: newName.trim() }, { merge: true });
    } catch (err) {
      console.error("Firestore category update error:", err);
    }
  }

  if (typeof window !== "undefined") {
    const categories = await getCategories();
    const updated = categories.map((c) =>
      c.id === id ? { ...c, name: newName.trim() } : c
    );
    memoryCategoriesCache = updated;
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(updated));
  }
}

/**
 * Deletes a category by id.
 */
export async function deleteCategory(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (err) {
      console.error("Firestore category delete error:", err);
    }
  }

  if (typeof window !== "undefined") {
    const categories = await getCategories();
    const updated = categories.filter((c) => c.id !== id);
    memoryCategoriesCache = updated;
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(updated));
  }
}

/**
 * Gets all saved music tracks.
 */
export async function getMusicTracks(): Promise<MusicTrack[]> {
  // 1. Try Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "music_tracks"), orderBy("createdAt", "desc"));
      const querySnapshot = await withTimeout(getDocs(q), 2500);
      if (!querySnapshot.empty) {
        const list: MusicTrack[] = [];
        querySnapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as MusicTrack);
        });
        memoryTracksCache = list;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(LOCAL_STORAGE_MUSIC_KEY, JSON.stringify(list));
          } catch {}
        }
        return list;
      } else {
        // If Firestore is empty, check if LocalStorage has existing tracks to migrate
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(LOCAL_STORAGE_MUSIC_KEY);
          if (stored) {
            const localTracks = JSON.parse(stored) as MusicTrack[];
            if (localTracks && localTracks.length > 0) {
              for (const t of localTracks) {
                try {
                  await setDoc(doc(db, "music_tracks", t.id), t);
                } catch {}
              }
              memoryTracksCache = localTracks;
              return localTracks;
            }
          }
        }
      }
    } catch (err) {
      console.warn("Firestore music fetch failed/timeout, falling back to local storage:", err);
    }
  }

  if (memoryTracksCache && memoryTracksCache.length > 0) {
    return memoryTracksCache;
  }

  // 2. Try LocalStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MUSIC_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MusicTrack[];
        if (parsed && parsed.length > 0) {
          memoryTracksCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Music read error:", e);
    }
  }

  return [];
}

/**
 * Saves a new or updated music track.
 */
export async function saveMusicTrack(track: MusicTrack): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "music_tracks", track.id), cleanForFirestore(track));
    } catch (err) {
      console.error("Firestore music track save error:", err);
    }
  }

  if (typeof window !== "undefined") {
    const tracks = await getMusicTracks();
    const index = tracks.findIndex((t) => t.id === track.id);
    let updated: MusicTrack[];
    if (index >= 0) {
      updated = [...tracks];
      updated[index] = track;
    } else {
      updated = [track, ...tracks];
    }
    localStorage.setItem(LOCAL_STORAGE_MUSIC_KEY, JSON.stringify(updated));
  }
}

/**
 * Deletes a music track by id.
 */
export async function deleteMusicTrack(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "music_tracks", id));
    } catch (err) {
      console.error("Firestore music delete error:", err);
    }
  }

  if (typeof window !== "undefined") {
    const tracks = await getMusicTracks();
    const updated = tracks.filter((t) => t.id !== id);
    localStorage.setItem(LOCAL_STORAGE_MUSIC_KEY, JSON.stringify(updated));
  }
}

const LOCAL_STORAGE_CUSTOM_PASSCODE_KEY = "gunduz_rakisi_custom_passcode";

/**
 * Gets the author custom passcode from Firestore (with LocalStorage fallback).
 */
export async function getAuthorPasscode(): Promise<string | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "settings", "author_auth"));
      if (snap.exists() && snap.data()?.passcode) {
        const pass = String(snap.data().passcode).trim();
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_CUSTOM_PASSCODE_KEY, pass);
        }
        return pass;
      }
    } catch (err) {
      console.warn("Firestore passcode fetch failed:", err);
    }
  }

  if (typeof window !== "undefined") {
    return localStorage.getItem(LOCAL_STORAGE_CUSTOM_PASSCODE_KEY);
  }

  return null;
}

/**
 * Saves a new author custom passcode to Firestore and LocalStorage.
 */
export async function saveAuthorPasscode(newPasscode: string): Promise<void> {
  const clean = newPasscode.trim();
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "settings", "author_auth"), {
        passcode: clean,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Firestore passcode save error:", err);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_PASSCODE_KEY, clean);
  }
}

const LOCAL_STORAGE_AUTHOR_PROFILE_KEY = "gunduz_rakisi_author_profile_v1";

/**
 * Gets the author profile image data URL from Firestore (with LocalStorage fallback).
 */
export async function getAuthorProfileImage(): Promise<string | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "settings", "author_profile"));
      if (snap.exists() && snap.data()?.profileImage) {
        const img = snap.data().profileImage as string;
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_AUTHOR_PROFILE_KEY, img);
        }
        return img;
      }
    } catch (err) {
      console.warn("Firestore author profile fetch failed:", err);
    }
  }

  if (typeof window !== "undefined") {
    return localStorage.getItem(LOCAL_STORAGE_AUTHOR_PROFILE_KEY);
  }

  return null;
}

/**
 * Saves a new author profile image data URL to Firestore and LocalStorage,
 * cleanly overwriting and deleting any previous image.
 */
export async function saveAuthorProfileImage(dataUrl: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "settings", "author_profile"), {
        profileImage: dataUrl,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Firestore author profile save error:", err);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_AUTHOR_PROFILE_KEY, dataUrl);
  }
}



