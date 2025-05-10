// TODO: Implement actual barcode scanning from video stream using a library if available
'use client';

import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Search, VideoOff, ScanEye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export default function BarcodeScannerClient() {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);

  useEffect(() => {
    const getCameraPermission = async () => {
      setIsCameraLoading(true);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia is not supported in this browser.');
        setHasCameraPermission(false);
        setIsCameraLoading(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access. Please enter the barcode manually.',
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraLoading(false);
          };
        } else {
           setIsCameraLoading(false);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setIsCameraLoading(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use the scanner, or enter the barcode manually.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!barcode.trim()) {
      setError('Barcode cannot be empty.');
      return;
    }
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
      <div className="w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border relative overflow-hidden shadow-inner">
        {isCameraLoading && hasCameraPermission !== false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <ScanEye className="w-16 h-16 text-primary animate-pulse mb-3" />
            <p className="text-muted-foreground">Starting camera...</p>
            <Skeleton className="w-full h-full absolute" />
          </div>
        )}
        <video 
          ref={videoRef} 
          className={`w-full h-full object-cover rounded-md ${isCameraLoading || hasCameraPermission === false ? 'hidden' : ''}`} 
          autoPlay 
          muted 
          playsInline
          aria-label="Camera feed for barcode scanning"
         />
        {hasCameraPermission === false && !isCameraLoading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <VideoOff className="w-16 h-16 text-destructive mb-3" />
            <p className="text-destructive font-semibold">Camera Inactive</p>
            <p className="text-muted-foreground text-sm">
              Camera access is denied or unavailable. Please use manual input.
            </p>
          </div>
        )}
      </div>
      
      {hasCameraPermission === false && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Camera permission was denied or is unavailable. Please enable it in your browser settings, or enter the barcode manually below.
          </AlertDescription>
        </Alert>
      )}
       {hasCameraPermission === true && !isCameraLoading && (
         <p className="text-sm text-muted-foreground text-center -mt-2">
            Point your camera at a barcode. (Automatic detection is not yet implemented, please enter manually)
        </p>
       )}


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
          disabled={isCameraLoading && hasCameraPermission !== false}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full text-lg py-3 h-auto rounded-md" 
        size="lg"
        disabled={isCameraLoading && hasCameraPermission !== false && !barcode.trim()}
      >
        <Search className="mr-2 h-5 w-5" />
        Fetch Product Details
      </Button>
    </form>
  );
}
