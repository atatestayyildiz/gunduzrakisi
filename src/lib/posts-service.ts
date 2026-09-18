"use client";

import { db, isFirebaseConfigured } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import { BookArticle, CategoryItem, MusicTrack } from "./types";
import { INITIAL_ARTICLES, INITIAL_CATEGORIES } from "./initial-data";

const LOCAL_STORAGE_ARTICLES_KEY = "gunduz_rakisi_articles_v5";
const LOCAL_STORAGE_CATEGORIES_KEY = "gunduz_rakisi_categories_v5";
const LOCAL_STORAGE_MUSIC_KEY = "gunduz_rakisi_music_tracks_v1";

/**
 * Gets all articles sorted by order.
 */
export async function getArticles(): Promise<BookArticle[]> {
  // 1. Try Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "articles"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const list: BookArticle[] = [];
        querySnapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as BookArticle);
        });
        return list;
      } else {
        // If Firestore is empty, check if LocalStorage has existing articles to migrate
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
          if (stored) {
            const localList = JSON.parse(stored) as BookArticle[];
            if (localList && localList.length > 0) {
              for (const a of localList) {
                try {
                  await setDoc(doc(db, "articles", a.id), a);
                } catch {}
              }
              return localList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            }
          }
        }
      }
    } catch (err) {
      console.warn("Firestore fetch failed, falling back to local storage:", err);
    }
  }

  // 2. Try LocalStorage
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
        if (parsed) {
          return parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
      }
    } catch (e) {
      console.warn("Local storage read error:", e);
    }
  }

  // 3. Fallback to initial seed articles (now completely empty)
  return INITIAL_ARTICLES.sort((a, b) => a.order - b.order);
}

/**
 * Saves or updates an article.
 */
export async function saveArticle(article: BookArticle): Promise<void> {
  // Update Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "articles", article.id), article);
    } catch (err) {
      console.error("Firestore save error:", err);
    }
  }

  // Update LocalStorage
  if (typeof window !== "undefined") {
    try {
      const articles = await getArticles();
      const index = articles.findIndex((a) => a.id === article.id);
      let updated: BookArticle[];
      if (index >= 0) {
        updated = [...articles];
        updated[index] = article;
      } else {
        updated = [article, ...articles];
      }
      localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage save error:", e);
    }
  }
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
    const articles = await getArticles();
    const updated = articles.filter((a) => a.id !== id);
    localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(updated));
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

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(updated));
  }

  if (isFirebaseConfigured && db) {
    try {
      for (const item of updated) {
        await setDoc(doc(db, "articles", item.id), item, { merge: true });
      }
    } catch (err) {
      console.error("Firestore order update error:", err);
    }
  }
}

/**
 * Gets all categories.
 */
export async function getCategories(): Promise<CategoryItem[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, "categories"));
      if (!snap.empty) {
        const list: CategoryItem[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as CategoryItem));
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
        return toSeed;
      }
    } catch (err) {
      console.warn("Firestore categories read error:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
      if (stored) {
        return JSON.parse(stored);
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
      await setDoc(doc(db, "categories", category.id), category);
    } catch (err) {
      console.error("Firestore category save error:", err);
    }
  }

  if (typeof window !== "undefined") {
    const categories = await getCategories();
    if (!categories.find((c) => c.id === category.id)) {
      const updated = [...categories, category];
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
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const list: MusicTrack[] = [];
        querySnapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as MusicTrack);
        });
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
              return localTracks;
            }
          }
        }
      }
    } catch (err) {
      console.warn("Firestore music fetch failed, falling back to local storage:", err);
    }
  }

  // 2. Try LocalStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_MUSIC_KEY);
      if (stored) {
        return JSON.parse(stored);
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
      await setDoc(doc(db, "music_tracks", track.id), track);
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

