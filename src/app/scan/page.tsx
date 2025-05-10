
import BarcodeScannerClient from "@/components/scanner/BarcodeScannerClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine, Camera } from "lucide-react";

export default function ScanPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
      <Card className="w-full max-w-lg shadow-xl rounded-lg">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="relative mx-auto h-16 w-16 md:h-20 md:w-20 mb-4">
            <ScanLine className="absolute inset-0 m-auto h-full w-full text-primary opacity-70 animate-pulse" />
            <Camera className="absolute inset-0 m-auto h-1/2 w-1/2 text-primary" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Scan Product Barcode</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-2 max-w-md mx-auto">
            Point your device&apos;s camera at a product barcode or enter it manually below.
            Get details and AI-powered health analysis for food and cosmetic products.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-8 px-6 md:px-8">
          <BarcodeScannerClient />
        </CardContent>
      </Card>
    </div>
  );
}
