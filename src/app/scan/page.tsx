
import BarcodeScannerClient from "@/components/scanner/BarcodeScannerClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine } from "lucide-react";

export default function ScanPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
      <Card className="w-full max-w-lg shadow-xl rounded-lg">
        <CardHeader className="text-center pt-8 pb-4">
          <ScanLine className="mx-auto h-12 w-12 md:h-16 md:w-16 text-primary mb-4 animate-pulse" />
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Scan Product Barcode</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-2 max-w-md mx-auto">
            Enter the product&apos;s barcode number below to fetch its details and AI-powered health analysis.
            Works for food and cosmetic products.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-8 px-6 md:px-8">
          <BarcodeScannerClient />
        </CardContent>
      </Card>
    </div>
  );
}
