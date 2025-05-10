
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, ScanLine, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <Sparkles className="h-6 w-6 text-accent" />
          <span className="font-bold sm:inline-block text-lg">
            Health & Beauty Scanner
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/scan">Scan</Link>
          </Button>
        </nav>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/scan">
              <ScanLine className="mr-2 h-4 w-4" />
              Scan Product
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

