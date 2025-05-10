
import BarcodeScannerClient from "@/components/scanner/BarcodeScannerClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine, Camera, QrCode } from "lucide-react";

export default function ScanPage() {
  return (
    <div className="flex flex-col items-center"> {/* Removed container, now in layout.tsx */}
      <Card className="w-full max-w-xl shadow-xl rounded-xl border-border/60">
        <CardHeader className="text-center pt-8 pb-6">
          <div className="relative mx-auto h-20 w-20 md:h-24 md:w-24 mb-6">
            <QrCode className="absolute inset-0 m-auto h-full w-full text-primary opacity-20 animate-pulse" />
            <Camera className="absolute inset-0 m-auto h-1/2 w-1/2 text-primary" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Scan Product Barcode</CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground pt-3 max-w-md mx-auto">
            Point your camera at a barcode or enter it manually below to get instant product insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-8 px-6 md:px-8">
          <BarcodeScannerClient />
        </CardContent>
      </Card>
    </div>
  );
}
