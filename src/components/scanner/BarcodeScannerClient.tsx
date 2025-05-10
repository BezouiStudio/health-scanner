
'use client';

import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Search, VideoOff, ScanEye, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import type { IScannerControls } from '@zxing/library';

export default function BarcodeScannerClient() {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const controlsRef = useRef<IScannerControls | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScannerInitializing, setIsScannerInitializing] = useState(true);
  const [scanFeedback, setScanFeedback] = useState<string | null>('Initializing scanner...');
  const [isScanSuccessful, setIsScanSuccessful] = useState(false);


  useEffect(() => {
    let streamTracksToStop: MediaStreamTrack[] = [];

    const startScanning = async () => {
      setIsScannerInitializing(true);
      setIsScanSuccessful(false);
      setScanFeedback("Requesting camera permission...");

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser.");
        }

        if (!videoRef.current) {
          // This case should ideally not happen if component renders correctly
          throw new Error("Video element not ready.");
        }
        
        // decodeContinuously will handle stream acquisition.
        // We set hasCameraPermission true optimistically, actual status confirmed by try/catch.
        setHasCameraPermission(true); 
        setIsScannerInitializing(false); 
        setScanFeedback("Scanner starting... Point camera at a barcode.");

        const controls = await codeReader.current.decodeContinuously(
          videoRef.current,
          (result, error) => {
            if (isScanSuccessful) return; // Don't process if already scanned

            if (result) {
              const scannedBarcode = result.getText();
              if (barcode !== scannedBarcode) { // Avoid re-processing same scan immediately
                setBarcode(scannedBarcode);
                setScanFeedback(`Scanned: ${scannedBarcode}`);
                setIsScanSuccessful(true);
                toast({
                  title: 'Barcode Scanned!',
                  description: `Detected: ${scannedBarcode}`,
                  action: <CheckCircle className="text-green-500" />,
                });
                
                if (controlsRef.current) {
                  controlsRef.current.stop();
                }
                codeReader.current.reset(); 
                if (videoRef.current && videoRef.current.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                    videoRef.current.srcObject = null;
                }
              }
            } else if (error && !(error instanceof NotFoundException)) {
              console.error('Barcode scan error:', error);
              // Potentially update scanFeedback for non-NotFound errors if they persist
            } else if (error instanceof NotFoundException) {
              if (!isScanSuccessful && videoRef.current?.srcObject) {
                   setScanFeedback("Searching for barcode...");
              }
            }
          }
        );
        controlsRef.current = controls;
        if (videoRef.current && videoRef.current.srcObject) {
           const stream = videoRef.current.srcObject as MediaStream;
           streamTracksToStop = stream.getTracks();
        }

      } catch (err: any) {
        console.error("Error initializing scanner:", err);
        let message = "Failed to initialize camera.";
        if (err.name === 'NotAllowedError') {
          message = "Camera permission denied. Please enable it in your browser settings.";
        } else if (err.message === "Camera API not supported in this browser.") {
          message = err.message;
        } else if (err.message && (err.message.includes("Requested device not found") || err.message.includes("Could notgetUserMedia")) ) {
          message = "No camera found or camera is busy. Please ensure a camera is connected, enabled, and not in use by another application.";
        }
        setScanFeedback(message);
        setIsScannerInitializing(false);
        setHasCameraPermission(false);
        toast({ variant: 'destructive', title: 'Camera Error', description: message });
      }
    };

    startScanning();

    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
      codeReader.current.reset();
      streamTracksToStop.forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

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

  const videoVisible = !isScannerInitializing && hasCameraPermission && videoRef.current?.srcObject && !isScanSuccessful;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border relative overflow-hidden shadow-inner">
        {isScannerInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 p-4 text-center">
            <ScanEye className="w-16 h-16 text-primary animate-pulse mb-3" />
            <p className="text-muted-foreground">{scanFeedback || 'Initializing scanner...'}</p>
            <Skeleton className="w-full h-full absolute" />
          </div>
        )}
        <video 
          ref={videoRef} 
          className={`w-full h-full object-cover rounded-md ${videoVisible ? '' : 'hidden'}`} 
          autoPlay 
          muted 
          playsInline
          aria-label="Camera feed for barcode scanning"
         />
        {!isScannerInitializing && !hasCameraPermission && (
           <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <CameraOff className="w-16 h-16 text-destructive mb-3" />
            <p className="text-destructive font-semibold">Camera Unavailable</p>
            <p className="text-muted-foreground text-sm max-w-xs">
              {scanFeedback || "Could not access camera. Please check permissions or use manual input."}
            </p>
          </div>
        )}
         {!isScannerInitializing && hasCameraPermission && isScanSuccessful && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-background/90">
                <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
                <p className="text-primary font-semibold">Scan Successful!</p>
                <p className="text-muted-foreground text-sm max-w-xs">
                    {scanFeedback || `Detected: ${barcode}`}
                </p>
            </div>
        )}
      </div>
      
      {scanFeedback && !isScannerInitializing && (hasCameraPermission || isScanSuccessful) && (
         <p className="text-sm text-muted-foreground text-center -mt-2">
            {scanFeedback}
        </p>
       )}


      <div>
        <label htmlFor="barcode-input" className="block text-sm font-medium text-foreground mb-1.5">
          Enter Barcode Manually or Scan
        </label>
        <Input
          id="barcode-input"
          type="text"
          value={barcode}
          onChange={(e) => {
            setBarcode(e.target.value);
            if (error) setError(null);
            if (isScanSuccessful) setIsScanSuccessful(false); // Allow re-scan or manual override
          }}
          placeholder="e.g., 1234567890123"
          className="text-lg py-3 h-auto"
          aria-label="Enter barcode manually"
          disabled={isScannerInitializing && hasCameraPermission !== false}
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
        disabled={(isScannerInitializing && hasCameraPermission !== false && !barcode.trim()) || !barcode.trim()}
      >
        <Search className="mr-2 h-5 w-5" />
        Fetch Product Details
      </Button>
    </form>
  );
}
