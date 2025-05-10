
'use client';

import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Package, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { searchProducts } from '@/lib/actions';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQueryFromUrl = searchParams.get('query') || '';
  
  const [query, setQuery] = useState(initialQueryFromUrl);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlQuery = searchParams.get('query') || '';
    if (urlQuery !== query) {
        setQuery(urlQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


  useEffect(() => {
    if (query.length < 2) { 
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSuggestionsLoading(true);
      try {
        const results = await searchProducts(query);
        setSuggestions(results.slice(0, 7)); 
        if (results.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(query.length >=2);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setIsSuggestionsLoading(false);
    }, 300); 

    return () => {
      clearTimeout(handler);
    };
  }, [query]);
  
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
    setShowSuggestions(false); 
    if (trimmedQuery) {
      router.push(`/search?query=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push('/search'); 
    }
  };

  const handleSuggestionClick = (suggestion: Product) => {
    setQuery(suggestion.name || '');
    setShowSuggestions(false);
    if (suggestion.barcode) {
        router.push(`/product/${suggestion.barcode}`);
    } else if (suggestion.name) {
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
        setShowSuggestions(true); 
    }
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <form onSubmit={handleSearch} className="flex w-full items-center space-x-2.5">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search food or cosmetics..."
          className="flex-grow text-base h-14 rounded-xl shadow-sm focus:shadow-lg focus:ring-2 focus:ring-primary/50 px-5"
          aria-label="Search products"
          autoComplete="off" 
        />
        <Button type="submit" aria-label="Submit search" size="lg" className="h-14 rounded-xl shadow-sm hover:shadow-lg px-6">
          <Search className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Search</span>
        </Button>
      </form>
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2.5 bg-card border border-border rounded-xl shadow-2xl max-h-[60vh] overflow-y-auto p-2.5">
          {isSuggestionsLoading && (
            <div className="px-4 py-3.5 flex items-center text-muted-foreground text-sm">
              <Loader2 className="h-5 w-5 mr-3 animate-spin text-primary" />
              Loading suggestions...
            </div>
          )}
          {!isSuggestionsLoading && suggestions.length === 0 && query.length >=2 && (
             <div className="px-4 py-3.5 text-sm text-center text-muted-foreground">No suggestions found for &quot;{query}&quot;.</div>
          )}
          {!isSuggestionsLoading && suggestions.length > 0 && (
            <ul className="space-y-1.5">
              {suggestions.map((suggestion) => (
                <li
                  key={(suggestion.barcode || suggestion.name) + Math.random()} 
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    handleSuggestionClick(suggestion);
                  }}
                  className={cn(
                    "flex items-center px-4 py-3 hover:bg-accent/50 dark:hover:bg-accent/20 hover:text-accent-foreground cursor-pointer rounded-lg transition-all duration-150 ease-in-out group",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-accent/50 dark:focus-visible:bg-accent/20"
                  )}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSuggestionClick(suggestion); }}
                >
                  <div className="flex-shrink-0 w-12 h-12 mr-4 bg-muted/60 rounded-lg shadow-sm border border-border/50 flex items-center justify-center overflow-hidden p-1">
                    {suggestion.imageUrl ? (
                        <Image src={suggestion.imageUrl} alt={(suggestion.name || 'Product').substring(0,10)} width={46} height={46} className="object-contain w-full h-full rounded-sm" data-ai-hint="product tiny"/>
                    ) : (
                        <Package className="w-6 h-6 text-muted-foreground/80" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {suggestion.name || 'Unnamed Product'}
                    </p>
                    {suggestion.brands && <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors truncate">{suggestion.brands}</p>}
                  </div>
                   <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground/70 group-hover:text-primary transition-all duration-200 group-hover:translate-x-0.5 opacity-70 group-hover:opacity-100"/>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
