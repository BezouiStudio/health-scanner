import BarcodeScannerClient from "@/components/scanner/BarcodeScannerClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine } from "lucide-react";

export default function ScanPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <ScanLine className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Scan Product Barcode</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-2">
            Enter the product&apos;s barcode number below to fetch its details and health score.
            Actual camera scanning is not implemented in this version.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <BarcodeScannerClient />
        </CardContent>
      </Card>
    </div>
  );
}
