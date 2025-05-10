
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ScanLine, Search, Leaf, Sparkles, ShieldCheck, BrainCircuit } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24"> {/* Removed container, now in layout.tsx */}
      <section className="text-center py-12 md:py-20">
        <div className="flex justify-center items-center gap-4 md:gap-6 mb-8">
          <Leaf className="h-16 w-16 md:h-20 md:w-20 text-primary animate-bounce" />
          <Sparkles className="h-16 w-16 md:h-20 md:w-20 text-accent animate-pulse" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Your Smart Health & Beauty Companion
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl lg:max-w-3xl mx-auto">
          Unlock insights into your food and cosmetic products. Search by name or scan a barcode for AI-powered ingredient analysis and health scores.
        </p>
        <div className="max-w-lg mx-auto mb-10">
          <SearchBar />
        </div>
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Link href="/scan">
            <ScanLine className="mr-2.5 h-6 w-6" />
            Scan Product Barcode
          </Link>
        </Button>
      </section>

      <section className="py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          <FeatureCard
            icon={<Search className="h-10 w-10 text-primary" />}
            title="Search or Scan"
            description="Easily find products by name or barcode. Use our scanner for quick barcode input and instant results."
          />
          <FeatureCard
            icon={<BrainCircuit className="h-10 w-10 text-primary" />}
            title="AI Ingredient Analysis"
            description="Our advanced AI evaluates ingredient lists to provide a comprehensive health & safety score (1-10)."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-10 w-10 text-primary" />}
            title="Informed Choices"
            description="Get clear, understandable insights to make better choices for your well-being and beauty routines."
          />
        </div>
      </section>

      <section className="py-12 md:py-16 text-center bg-secondary/50 rounded-xl shadow-inner border">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Dive Deeper?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Start exploring products now and take control of what you use and consume.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Link href="/search">
              <Search className="mr-2 h-5 w-5" />
              Search Products
            </Link>
          </Button>
           <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Link href="/scan">
              <ScanLine className="mr-2 h-5 w-5" />
              Scan a Barcode
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-center shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl border-border/70 transform hover:-translate-y-1">
      <CardHeader className="items-center pt-8 pb-4">
        <div className="p-5 bg-primary/10 rounded-full mb-5 inline-block shadow-sm border border-primary/20">
          {icon}
        </div>
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-8 px-6">
        <CardDescription className="text-base text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
