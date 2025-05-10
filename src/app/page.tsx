
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ScanLine, Search, Leaf, Sparkles } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-16 md:py-24 rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-inner border border-border/30">
        <div className="flex justify-center items-center gap-6 mb-8">
          <Leaf className="mx-auto h-20 w-20 md:h-24 md:w-24 text-primary" />
          <Sparkles className="mx-auto h-20 w-20 md:h-24 md:w-24 text-accent" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          Welcome to Health & Beauty Scanner
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl lg:max-w-3xl mx-auto">
          Discover the health and safety score of your food and cosmetic products.
          Simply search by name or scan a barcode to get an AI-powered analysis of ingredients.
        </p>
        <div className="max-w-xl mx-auto mb-12">
          <SearchBar />
        </div>
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Link href="/scan">
            <ScanLine className="mr-2 h-6 w-6" />
            Scan a Product Barcode
          </Link>
        </Button>
      </section>

      <section className="py-16 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-lg">
            <CardHeader className="items-center pt-8">
              <div className="p-4 bg-primary/10 rounded-full mb-4 shadow-sm">
                <Search className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Search or Scan</CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <CardDescription className="text-center text-base px-2">
                Easily find food or cosmetic products by typing their name or barcode. Or, use our scanner page to input a barcode quickly.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-lg">
            <CardHeader className="items-center pt-8">
               <div className="p-4 bg-primary/10 rounded-full mb-4 shadow-sm">
                <Image src="https://picsum.photos/120/120" alt="AI Analysis" width={40} height={40} className="rounded-full" data-ai-hint="brain circuit" />
              </div>
              <CardTitle className="text-2xl">AI Ingredient Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <CardDescription className="text-center text-base px-2">
                Our advanced AI evaluates the product's ingredient list to provide a comprehensive health and safety score from 1 to 10.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-lg">
            <CardHeader className="items-center pt-8">
               <div className="p-4 bg-accent/10 rounded-full mb-4 shadow-sm">
                <Sparkles className="h-10 w-10 text-accent" />
              </div>
              <CardTitle className="text-2xl">Informed Choices</CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <CardDescription className="text-center text-base px-2">
                Get clear, understandable product information and health insights to make better choices for your well-being and beauty routines.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
