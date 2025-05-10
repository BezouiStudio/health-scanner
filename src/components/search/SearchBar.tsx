
'use client';

import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { searchProducts } from '@/lib/actions';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQueryFromUrl = searchParams.get('query') || '';
  
  const [query, setQuery] = useState(initialQueryFromUrl);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Effect to update local query state if the URL query parameter changes
  useEffect(() => {
    const urlQuery = searchParams.get('query') || '';
    if (urlQuery !== query) {
        setQuery(urlQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


  // Effect for fetching suggestions
  useEffect(() => {
    if (query.length < 2) { // Minimum characters to trigger suggestions
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSuggestionsLoading(true);
      try {
        const results = await searchProducts(query);
        setSuggestions(results);
        if (results.length > 0) {
            setShowSuggestions(true);
        } else {
            // Keep suggestions box open to show "No suggestions found" if query is long enough
            setShowSuggestions(query.length >=2);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setIsSuggestionsLoading(false);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [query]);
  
  // Effect to handle clicks outside the search bar to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);


  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    setShowSuggestions(false); // Hide suggestions on search submission
    if (trimmedQuery) {
      router.push(`/search?query=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push('/search'); 
    }
  };

  const handleSuggestionClick = (suggestion: Product) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    router.push(`/search?query=${encodeURIComponent(suggestion.name)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (query.length >= 2) { // Show suggestions on focus if query is already populated and long enough
        setShowSuggestions(true);
    }
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search food or cosmetics by name or barcode..."
          className="flex-grow text-base"
          aria-label="Search products"
          autoComplete="off" 
        />
        <Button type="submit" aria-label="Submit search">
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </form>
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
          {isSuggestionsLoading && (
            <div className="px-4 py-3 flex items-center text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading suggestions...
            </div>
          )}
          {!isSuggestionsLoading && suggestions.length === 0 && query.length >=2 && (
             <div className="px-4 py-3 text-sm text-muted-foreground">No suggestions found for &quot;{query}&quot;.</div>
          )}
          {!isSuggestionsLoading && suggestions.length > 0 && (
            <ul>
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.barcode + suggestion.name} // Ensure unique key
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    handleSuggestionClick(suggestion);
                  }}
                  className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors text-sm"
                >
                  {suggestion.name}
                  {suggestion.brands && <span className="text-xs text-muted-foreground ml-2">({suggestion.brands})</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
