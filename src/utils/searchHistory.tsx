const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_HISTORY_ITEMS = 10;

export type SearchHistoryItem = {
  query: string;
  timestamp: string;
};

/**
 * Obtiene el historial de búsquedas del usuario
 */
export function getSearchHistory(userId?: string): SearchHistoryItem[] {
  try {
    if (!userId) return [];
    
    const key = `${SEARCH_HISTORY_KEY}_${userId}`;
    const historyStr = localStorage.getItem(key);
    
    if (!historyStr) {
      return [];
    }
    
    const history: SearchHistoryItem[] = JSON.parse(historyStr);
    return history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error al cargar historial de búsquedas:', error);
    return [];
  }
}

/**
 * Agrega una búsqueda al historial
 */
export function addToSearchHistory(query: string, userId?: string): void {
  try {
    if (!query.trim() || !userId) return;
    
    const key = `${SEARCH_HISTORY_KEY}_${userId}`;
    const history = getSearchHistory(userId);
    
    // No agregar si es duplicado reciente (mismo query en los últimos 3 items)
    const recentDuplicate = history
      .slice(0, 3)
      .some(item => item.query.toLowerCase() === query.toLowerCase());
    
    if (recentDuplicate) return;
    
    // Agregar nueva búsqueda
    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: new Date().toISOString(),
    };
    
    // Agregar al inicio y limitar a MAX_HISTORY_ITEMS
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(key, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error al guardar búsqueda:', error);
  }
}

/**
 * Elimina una búsqueda del historial
 */
export function removeFromSearchHistory(query: string, userId?: string): void {
  try {
    if (!userId) return;
    
    const key = `${SEARCH_HISTORY_KEY}_${userId}`;
    const history = getSearchHistory(userId);
    
    const updatedHistory = history.filter(
      item => item.query.toLowerCase() !== query.toLowerCase()
    );
    
    localStorage.setItem(key, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error al eliminar búsqueda:', error);
  }
}

/**
 * Limpia todo el historial de búsquedas
 */
export function clearSearchHistory(userId?: string): void {
  try {
    if (!userId) return;
    
    const key = `${SEARCH_HISTORY_KEY}_${userId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error al limpiar historial:', error);
  }
}

/**
 * Obtiene las búsquedas más frecuentes
 */
export function getTopSearches(userId?: string, limit: number = 5): string[] {
  try {
    if (!userId) return [];
    
    const history = getSearchHistory(userId);
    
    // Contar frecuencia de cada query
    const frequencyMap: { [key: string]: number } = {};
    
    history.forEach(item => {
      const key = item.query.toLowerCase();
      frequencyMap[key] = (frequencyMap[key] || 0) + 1;
    });
    
    // Ordenar por frecuencia
    const sorted = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
    
    return sorted;
  } catch (error) {
    console.error('Error al obtener búsquedas frecuentes:', error);
    return [];
  }
}