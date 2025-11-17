import { Search, X, SlidersHorizontal, Clock, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getSearchHistory, addToSearchHistory, removeFromSearchHistory, clearSearchHistory, type SearchHistoryItem } from '../utils/searchHistory';

type SearchBarProps = {
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  categories: string[];
  currentFilters: SearchFilters;
  userId?: string; // Para acceder al historial personalizado
};

export type SearchFilters = {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name-asc';
};

export function SearchBar({ onSearch, onFilterChange, categories, currentFilters, userId }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
    if (value) {
      addToSearchHistory(value, userId);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    onSearch('');
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = {
      category: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.category !== 'all' || 
    filters.minPrice !== '' || 
    filters.maxPrice !== '' || 
    filters.sortBy !== 'newest';

  useEffect(() => {
    const history = getSearchHistory(userId);
    setSearchHistory(history);
  }, [userId]);

  const handleSearchHistoryClick = (item: SearchHistoryItem) => {
    setQuery(item.query);
    onSearch(item.query);
  };

  const handleRemoveFromHistory = (item: SearchHistoryItem) => {
    removeFromSearchHistory(item.query, userId);
    const updatedHistory = getSearchHistory(userId);
    setSearchHistory(updatedHistory);
  };

  const handleClearHistory = () => {
    clearSearchHistory(userId);
    setSearchHistory([]);
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10 h-12 text-base"
            ref={searchInputRef}
          />
          {query && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Filters Button */}
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className={`h-12 px-4 relative ${hasActiveFilters ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-emerald-600 h-auto py-1"
              >
                Limpiar todo
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Categoría</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Rango de Precio (Q)</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Mín"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="flex-1"
                min="0"
                step="0.01"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="Máx"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="flex-1"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Ordenar por</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value as SearchFilters['sortBy'])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más Nuevo</SelectItem>
                <SelectItem value="oldest">Más Antiguo</SelectItem>
                <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-600 mb-2">Filtros activos:</p>
              <div className="flex flex-wrap gap-2">
                {filters.category !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded">
                    {filters.category}
                    <button
                      onClick={() => handleFilterChange('category', 'all')}
                      className="hover:text-emerald-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.minPrice && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Mín: Q{filters.minPrice}
                    <button
                      onClick={() => handleFilterChange('minPrice', '')}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Máx: Q{filters.maxPrice}
                    <button
                      onClick={() => handleFilterChange('maxPrice', '')}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.sortBy !== 'newest' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {filters.sortBy === 'oldest' && 'Más Antiguo'}
                    {filters.sortBy === 'price-asc' && 'Precio ↑'}
                    {filters.sortBy === 'price-desc' && 'Precio ↓'}
                    {filters.sortBy === 'name-asc' && 'A-Z'}
                    <button
                      onClick={() => handleFilterChange('sortBy', 'newest')}
                      className="hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <Card className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Historial de Búsqueda</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-emerald-600 h-auto py-1"
            >
              Limpiar todo
            </Button>
          </div>

          <div className="space-y-2">
            {searchHistory.map((item) => (
              <div key={item.query} className="flex items-center justify-between">
                <button
                  onClick={() => handleSearchHistoryClick(item)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {item.query}
                </button>
                <button
                  onClick={() => handleRemoveFromHistory(item)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}