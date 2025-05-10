
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ScanLine, Search, Leaf, Sparkles } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-12 md:py-20">
        <div className="flex justify-center items-center gap-4 mb-6">
          <Leaf className="mx-auto h-16 w-16 text-primary" />
          <Sparkles className="mx-auto h-16 w-16 text-accent" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Welcome to Health & Beauty Scanner
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover the health and safety score of your food and cosmetic products.
          Simply search by name or scan a barcode to get an AI-powered analysis of ingredients.
        </p>
        <div className="max-w-xl mx-auto mb-10">
          <SearchBar />
        </div>
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/scan">
            <ScanLine className="mr-2 h-5 w-5" />
            Scan a Product Barcode
          </Link>
        </Button>
      </section>

      <section className="py-12 md:py-16">
        <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="items-center">
              <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Search or Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Easily find food or cosmetic products by typing their name or barcode. Or, use our scanner page to input a barcode quickly.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="items-center">
               <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Image src="https://picsum.photos/100/100" alt="AI Analysis" width={32} height={32} className="rounded-full" data-ai-hint="brain circuit" />
              </div>
              <CardTitle className="text-xl">AI Ingredient Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Our advanced AI evaluates the product's ingredient list to provide a comprehensive health and safety score from 1 to 10.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="items-center">
               <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-xl">Informed Choices</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get clear, understandable product information and health insights to make better choices for your well-being and beauty routines.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

