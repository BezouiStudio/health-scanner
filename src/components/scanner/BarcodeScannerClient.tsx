'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Camera, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BarcodeScannerClient() {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!barcode.trim()) {
      setError('Barcode cannot be empty.');
      return;
    }
    // Basic validation for typical EAN-13 or UPC-A barcode lengths
    if (!/^\d{8,14}$/.test(barcode.trim())) {
        setError('Invalid barcode format. Enter 8-14 digits.');
        return;
    }

    toast({
      title: "Processing Barcode",
      description: `Looking up product with barcode: ${barcode}`,
      action: <CheckCircle className="text-green-500" />,
    });
    router.push(`/product/${barcode.trim()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="w-full aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-300">
        <Camera className="w-16 h-16 text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground text-sm">Camera View (Mock)</p>
        <p className="text-xs text-muted-foreground/80">(Live scanning not implemented)</p>
      </div>
      
      <div>
        <label htmlFor="barcode-input" className="block text-sm font-medium text-foreground mb-1.5">
          Enter Barcode Manually
        </label>
        <Input
          id="barcode-input"
          type="text"
          value={barcode}
          onChange={(e) => {
            setBarcode(e.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g., 1234567890123"
          className="text-lg py-3 h-auto"
          aria-label="Enter barcode manually"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full text-lg py-3 h-auto rounded-md" size="lg">
        <Search className="mr-2 h-5 w-5" />
        Fetch Product Details
      </Button>
    </form>
  );
}
