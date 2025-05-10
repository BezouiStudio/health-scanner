

'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQueryFromUrl = searchParams.get('query') || '';
  const [query, setQuery] = useState(initialQueryFromUrl);

  // Effect to update local query state if the URL query parameter changes
  useEffect(() => {
    const urlQuery = searchParams.get('query') || '';
    if (urlQuery !== query) { // Only set if different to avoid re-render loop
        setQuery(urlQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/search?query=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search food or cosmetics by name or barcode..."
        className="flex-grow text-base"
        aria-label="Search products"
      />
      <Button type="submit" aria-label="Submit search">
        <Search className="h-5 w-5 mr-2" />
        Search
      </Button>
    </form>
  );
}


