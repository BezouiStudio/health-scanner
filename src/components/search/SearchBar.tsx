'use client';

import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Package } from 'lucide-react';
import type { Product } from '@/lib/types';
import { searchProducts } from '@/lib/actions';
import Image from 'next/image';

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
        setSuggestions(results.slice(0, 7)); // Limit to 7 suggestions
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
    // Navigate to product page directly if barcode exists, otherwise to search page
    if (suggestion.barcode) {
        router.push(`/product/${suggestion.barcode}`);
    } else {
        router.push(`/search?query=${encodeURIComponent(suggestion.name)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (query.length >= 2 && suggestions.length > 0) { 
        setShowSuggestions(true);
    } else if (query.length >=2 && !isSuggestionsLoading) {
        setShowSuggestions(true); // Show "no results" if applicable
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
          className="flex-grow text-base h-12 rounded-lg shadow-sm focus:shadow-md"
          aria-label="Search products"
          autoComplete="off" 
        />
        <Button type="submit" aria-label="Submit search" size="lg" className="h-12 rounded-lg shadow-sm hover:shadow-md">
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </form>
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border border-border rounded-xl shadow-2xl max-h-96 overflow-y-auto p-2">
          {isSuggestionsLoading && (
            <div className="px-4 py-3 flex items-center text-muted-foreground">
              <Loader2 className="h-5 w-5 mr-3 animate-spin text-primary" />
              Loading suggestions...
            </div>
          )}
          {!isSuggestionsLoading && suggestions.length === 0 && query.length >=2 && (
             <div className="px-4 py-3 text-sm text-center text-muted-foreground">No suggestions found for &quot;{query}&quot;.</div>
          )}
          {!isSuggestionsLoading && suggestions.length > 0 && (
            <ul className="space-y-1">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.barcode + suggestion.name} // Ensure unique key
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    handleSuggestionClick(suggestion);
                  }}
                  className="flex items-center px-3 py-2.5 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md transition-all duration-150 ease-in-out group"
                >
                  <div className="flex-shrink-0 w-10 h-10 mr-3 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    {suggestion.imageUrl ? (
                        <Image src={suggestion.imageUrl} alt={suggestion.name.substring(0,10)} width={40} height={40} className="object-contain w-full h-full" data-ai-hint="product tiny"/>
                    ) : (
                        <Package className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-accent-foreground truncate">
                        {suggestion.name}
                    </p>
                    {suggestion.brands && <p className="text-xs text-muted-foreground group-hover:text-accent-foreground/80 truncate">{suggestion.brands}</p>}
                  </div>
                   <Search className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
