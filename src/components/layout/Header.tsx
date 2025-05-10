
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, ScanLine, Sparkles, Home, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-2 sm:mr-6 flex items-center space-x-2 group">
          <Leaf className="h-7 w-7 text-primary group-hover:animate-pulse" />
          <Sparkles className="h-7 w-7 text-accent group-hover:animate-pulse delay-150" />
          <span className="font-bold hidden sm:inline-block text-xl text-foreground group-hover:text-primary transition-colors">
            Health & Beauty Scanner
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-1 sm:space-x-2">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
            <Link href="/">
              <Home className="h-5 w-5 sm:mr-2" /> 
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
            <Link href="/scan">
              <ScanLine className="h-5 w-5 sm:mr-2" />
               <span className="hidden sm:inline">Scan</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
            <Link href="/search">
              <Search className="h-5 w-5 sm:mr-2" />
               <span className="hidden sm:inline">Search</span>
            </Link>
          </Button>
        </nav>
        <div className="flex items-center space-x-2">
          <Button asChild className="rounded-full shadow-sm hover:shadow-md transition-shadow">
            <Link href="/scan">
              <ScanLine className="h-5 w-5 sm:mr-2" /> {/* Icon, margin on sm+ */}
              <span className="hidden sm:inline">Scan Product</span> {/* Text hidden on xs */}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

