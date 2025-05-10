
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, ScanLine, Sparkles, Home, Search, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'; // For mobile menu
import { cn } from '@/lib/utils';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/75 shadow-sm">
      <div className="container mx-auto flex h-20 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2.5 group">
          <div className="relative">
            <Leaf className="h-9 w-9 text-primary transition-transform group-hover:rotate-12 duration-300 ease-out" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-accent transition-all delay-100 group-hover:scale-125 duration-300 ease-out" />
          </div>
          <span className="font-bold text-2xl text-foreground group-hover:text-primary transition-colors hidden md:inline-block tracking-tight">
            Health & Beauty Scanner
          </span>
           <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors md:hidden tracking-tight">
            H&B Scan
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center space-x-1 lg:space-x-2">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10 text-base font-medium px-3.5 py-2">
            <Link href="/">
              <Home className="h-5 w-5 mr-1.5" /> 
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10 text-base font-medium px-3.5 py-2">
            <Link href="/search">
              <Search className="h-5 w-5 mr-1.5" />
              Search
            </Link>
          </Button>
           <Button asChild className="text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5">
            <Link href="/scan">
              <ScanLine className="h-5 w-5 mr-2" />
              Scan Product
            </Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="ml-auto md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent/10 hover:text-accent rounded-lg p-1.5">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 bg-background/95 backdrop-blur-md flex flex-col">
              <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <Link href="/" className="flex items-center space-x-2.5 group mb-2">
                   <div className="relative">
                    <Leaf className="h-8 w-8 text-primary" />
                     <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent" />
                   </div>
                   <span className="font-bold text-2xl text-foreground">H&B Scanner</span>
                </Link>
              </SheetHeader>
              <nav className="flex flex-col space-y-2 p-4 flex-1">
                <Button variant="ghost" asChild className="text-lg justify-start text-muted-foreground hover:text-primary hover:bg-primary/10 py-3 px-4">
                  <Link href="/">
                    <Home className="h-5 w-5 mr-3.5" /> Home
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="text-lg justify-start text-muted-foreground hover:text-primary hover:bg-primary/10 py-3 px-4">
                  <Link href="/search">
                    <Search className="h-5 w-5 mr-3.5" /> Search
                  </Link>
                </Button>
                <Button variant="default" asChild className="text-lg justify-start mt-4 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4">
                  <Link href="/scan">
                    <ScanLine className="h-5 w-5 mr-3.5" /> Scan Product
                  </Link>
                </Button>
              </nav>
              <div className="p-4 mt-auto border-t">
                <p className="text-xs text-muted-foreground text-center">&copy; {new Date().getFullYear()} H&B Scanner</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
