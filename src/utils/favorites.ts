// Utilities for managing favorites in localStorage

export type Favorite = {
  userId: string;
  productId: string;
  addedAt: string;
};

const FAVORITES_KEY = 'favorites';

export function getFavorites(userId: string): string[] {
  const favoritesStr = localStorage.getItem(FAVORITES_KEY);
  if (!favoritesStr) return [];

  const allFavorites: Favorite[] = JSON.parse(favoritesStr);
  return allFavorites
    .filter(fav => fav.userId === userId)
    .map(fav => fav.productId);
}

export function isFavorite(userId: string, productId: string): boolean {
  const favorites = getFavorites(userId);
  return favorites.includes(productId);
}

export function addFavorite(userId: string, productId: string): void {
  const favoritesStr = localStorage.getItem(FAVORITES_KEY);
  const allFavorites: Favorite[] = favoritesStr ? JSON.parse(favoritesStr) : [];

  // Check if already exists
  const exists = allFavorites.some(
    fav => fav.userId === userId && fav.productId === productId
  );

  if (!exists) {
    allFavorites.push({
      userId,
      productId,
      addedAt: new Date().toISOString(),
    });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites));
  }
}

export function removeFavorite(userId: string, productId: string): void {
  const favoritesStr = localStorage.getItem(FAVORITES_KEY);
  if (!favoritesStr) return;

  const allFavorites: Favorite[] = JSON.parse(favoritesStr);
  const updated = allFavorites.filter(
    fav => !(fav.userId === userId && fav.productId === productId)
  );

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
}

export function toggleFavorite(userId: string, productId: string): boolean {
  if (isFavorite(userId, productId)) {
    removeFavorite(userId, productId);
    return false;
  } else {
    addFavorite(userId, productId);
    return true;
  }
}

export function getFavoritesCount(userId: string): number {
  return getFavorites(userId).length;
}
