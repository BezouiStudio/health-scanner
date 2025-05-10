
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, ScanLine, Sparkles, Home, Search, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // For mobile menu

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-sm">
      <div className="container mx-auto flex h-20 items-center px-4 sm:px-6 lg:px-8"> {/* Increased height and padding */}
        <Link href="/" className="mr-4 flex items-center space-x-2 group">
          <Leaf className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
          <Sparkles className="h-8 w-8 text-accent transition-transform group-hover:rotate-12 delay-75" />
          <span className="font-bold text-2xl text-foreground group-hover:text-primary transition-colors hidden md:inline-block">
            Health & Beauty Scanner
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center space-x-2 lg:space-x-4">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10 text-base">
            <Link href="/">
              <Home className="h-5 w-5 mr-1.5" /> 
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10 text-base">
            <Link href="/search">
              <Search className="h-5 w-5 mr-1.5" />
              Search
            </Link>
          </Button>
           <Button asChild className="text-base rounded-lg shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90">
            <Link href="/scan">
              <ScanLine className="h-5 w-5 mr-1.5" />
              Scan Product
            </Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="ml-auto md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-6">
              <div className="mb-8">
                <Link href="/" className="flex items-center space-x-2 group mb-2">
                  <Leaf className="h-7 w-7 text-primary" />
                  <Sparkles className="h-7 w-7 text-accent" />
                   <span className="font-bold text-xl text-foreground">H&B Scanner</span>
                </Link>
              </div>
              <nav className="flex flex-col space-y-3">
                <Button variant="ghost" asChild className="text-lg justify-start text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <Link href="/">
                    <Home className="h-5 w-5 mr-3" /> Home
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="text-lg justify-start text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <Link href="/search">
                    <Search className="h-5 w-5 mr-3" /> Search
                  </Link>
                </Button>
                <Button variant="default" asChild className="text-lg justify-start mt-4">
                  <Link href="/scan">
                    <ScanLine className="h-5 w-5 mr-3" /> Scan Product
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
