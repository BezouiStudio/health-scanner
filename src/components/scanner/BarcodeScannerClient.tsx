
'use client';

import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Search, CameraOff, ScanEye, VideoOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { BrowserMultiFormatReader, NotFoundException, type IScannerControls } from '@zxing/library';

export default function BarcodeScannerClient() {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const controlsRef = useRef<IScannerControls | null>(null);
  const isMountedRef = useRef(true);
  const streamTracksRef = useRef<MediaStreamTrack[]>([]);
  const scanProcessedRef = useRef(false); 

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); 
  const [isScannerInitializing, setIsScannerInitializing] = useState(true);
  const [scanFeedback, setScanFeedback] = useState<string | null>('Initializing scanner...');
  const [isScanSuccessful, setIsScanSuccessful] = useState(false);


  useEffect(() => {
    isMountedRef.current = true;

    const startScanning = async () => {
      if (!isMountedRef.current) return;
      
      setIsScannerInitializing(true);
      scanProcessedRef.current = false; 
      setIsScanSuccessful(false); 
      setScanFeedback("Requesting camera permission...");

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser.");
        }
        if (!videoRef.current) {
          throw new Error("Video element not ready.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        
        if (!isMountedRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamTracksRef.current = stream.getTracks();

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = async () => {
            if (!isMountedRef.current || !videoRef.current || scanProcessedRef.current) {
               if (videoRef.current?.srcObject) { 
                  const activeStream = videoRef.current.srcObject as MediaStream;
                  activeStream.getTracks().forEach(track => track.stop());
                  videoRef.current.srcObject = null;
              }
              return;
            }

            if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
              console.warn("Video metadata loaded, but dimensions are zero.");
              if (isMountedRef.current && !scanProcessedRef.current) {
                setScanFeedback("Video stream has an issue (zero dimensions). Try refreshing.");
                setIsScannerInitializing(false);
                setHasCameraPermission(true); 
              }
              return; 
            }
            
            try {
              if (videoRef.current.paused) {
                await videoRef.current.play();
              }

              if (isMountedRef.current && !scanProcessedRef.current) {
                setHasCameraPermission(true);
                setIsScannerInitializing(false);
                setScanFeedback("Scanner active. Point camera at a barcode.");

                const controls = await codeReader.current.decodeContinuously(
                  videoRef.current,
                  (result, decodeError) => {
                    if (!isMountedRef.current || scanProcessedRef.current) {
                      return;
                    }

                    if (result) {
                      scanProcessedRef.current = true; 

                      const scannedBarcode = result.getText();
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
                      streamTracksRef.current.forEach(track => track.stop());
                      streamTracksRef.current = [];
                      if (videoRef.current && videoRef.current.srcObject) {
                        videoRef.current.srcObject = null;
                      }
                      return; 
                    }
                    
                    if (decodeError) { 
                      if (decodeError instanceof NotFoundException) {
                        if (videoRef.current?.srcObject) { 
                           setScanFeedback("Searching for barcode...");
                        }
                      } else {
                        console.error('Barcode scan error (not NotFoundException):', decodeError);
                      }
                    }
                  }
                );
                if (isMountedRef.current) {
                    controlsRef.current = controls;
                } else {
                    controls.stop(); 
                }
              }
            } catch (playError) {
              console.error("Video play() failed in onloadedmetadata:", playError);
              if (isMountedRef.current) {
                setScanFeedback("Could not start video. Check permissions or if camera is in use.");
                setIsScannerInitializing(false);
                setHasCameraPermission(false);
                toast({ variant: 'destructive', title: 'Video Error', description: "Could not start video playback." });
              }
            }
          };

          videoRef.current.onerror = (e) => {
            console.error("Video element error:", e);
            if(isMountedRef.current) {
              setScanFeedback("Video element failed to load. Try again or enter manually.");
              setIsScannerInitializing(false);
              setHasCameraPermission(false); 
            }
          };
        }
      } catch (err: any) {
        console.error("Error initializing scanner (getUserMedia or setup):", err);
        if (isMountedRef.current) {
          let message = "Failed to initialize camera.";
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            message = "Camera permission denied. Please enable it in your browser settings.";
          } else if (err.message === "Camera API not supported in this browser.") {
            message = err.message;
          } else if (err.name === 'NotFoundError' || (err.message && (err.message.includes("Requested device not found") || err.message.includes("Could not get UserMedia")))) {
            message = "No camera found or camera is busy. Ensure it's connected, enabled, and not used by another app.";
          }
          setScanFeedback(message);
          setIsScannerInitializing(false);
          setHasCameraPermission(false);
          toast({ variant: 'destructive', title: 'Camera Error', description: message });
        }
      }
    };

    startScanning();

    return () => {
      isMountedRef.current = false;
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
      codeReader.current.reset(); 
      
      streamTracksRef.current.forEach(track => track.stop());
      streamTracksRef.current = [];

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onerror = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) {
      setError('Barcode cannot be empty.');
      return;
    }
    if (!/^\d{8,14}$/.test(trimmedBarcode)) {
      setError('Invalid barcode format. Enter 8-14 digits.');
      return;
    }

    toast({
      title: "Processing Barcode",
      description: `Looking up product with barcode: ${trimmedBarcode}`,
    });
    router.push(`/product/${trimmedBarcode}`);
  };

  const videoActuallyVisible = hasCameraPermission === true && !isScannerInitializing && !isScanSuccessful && videoRef.current?.srcObject;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="w-full aspect-[4/3] sm:aspect-video bg-muted rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border/70 relative overflow-hidden shadow-inner">
        {(isScannerInitializing && hasCameraPermission === null) && ( 
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-10 p-4 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-medium text-lg">{scanFeedback || 'Requesting camera...'}</p>
            <Skeleton className="w-full h-full absolute inset-0 bg-muted/30 -z-10" />
          </div>
        )}
        
        <video 
          ref={videoRef} 
          className={`w-full h-full object-cover rounded-md transition-opacity duration-300 ${videoActuallyVisible ? 'opacity-100' : 'opacity-0 hidden'}`} 
          autoPlay 
          muted 
          playsInline
          aria-label="Camera feed for barcode scanning"
         />

        {(!isScannerInitializing && hasCameraPermission === false) && ( 
           <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <CameraOff className="w-16 h-16 text-destructive mb-4" />
            <p className="text-destructive font-semibold text-xl">Camera Unavailable</p>
            <p className="text-muted-foreground text-sm max-w-xs mt-1">
              {scanFeedback || "Could not access camera. Check permissions or use manual input."}
            </p>
          </div>
        )}

        {(hasCameraPermission === true && !isScannerInitializing && !isScanSuccessful && !videoRef.current?.srcObject) && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <VideoOff className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-semibold text-xl">Video Stream Ended</p>
                <p className="text-muted-foreground text-sm max-w-xs mt-1">
                 The camera stream has stopped. This can happen if the scan was completed or if there was an issue.
                </p>
            </div>
        )}
        
        {isScanSuccessful && ( 
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-background/95">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-primary font-semibold text-xl">Scan Successful!</p>
                <p className="text-muted-foreground text-base max-w-xs mt-1">
                    {scanFeedback || `Detected: ${barcode}`}
                </p>
                <p className="text-xs text-muted-foreground mt-3">You can now submit or edit the barcode below.</p>
            </div>
        )}
      </div>
      
      <div className="mt-4 text-center min-h-[2.5rem] px-2">
        {videoActuallyVisible && scanFeedback && (scanFeedback.toLowerCase().includes("searching") || scanFeedback.toLowerCase().includes("scanner active")) && (
          <p className="text-sm text-primary animate-pulse bg-primary/10 p-2.5 rounded-lg shadow-sm inline-flex items-center">
            <ScanEye className="inline-block h-5 w-5 mr-2 align-middle" />
            {scanFeedback}
          </p>
        )}
        {hasCameraPermission === null && !isScannerInitializing && scanFeedback && 
         (scanFeedback.toLowerCase().includes('error') || scanFeedback.toLowerCase().includes('fail')) && (
           <p className="text-sm text-destructive bg-destructive/10 p-2.5 rounded-lg shadow-sm inline-flex items-center">
             <AlertCircle className="inline-block h-5 w-5 mr-2 align-middle" />
             {scanFeedback}
           </p>
        )}
      </div>

      <div>
        <label htmlFor="barcode-input" className="block text-base font-medium text-foreground mb-2">
          Enter Barcode or Edit Scan
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
          className="text-lg py-3.5 h-auto rounded-lg shadow-sm focus:shadow-md focus:ring-2 focus:ring-primary/50 px-4"
          aria-label="Enter or edit barcode"
          disabled={isScannerInitializing && hasCameraPermission === null} 
        />
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-lg shadow-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Input Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full text-lg py-3.5 h-auto rounded-lg shadow-md hover:shadow-lg transition-all" 
        size="lg"
        disabled={!barcode.trim() || (isScannerInitializing && hasCameraPermission === null)}
      >
        <Search className="mr-2 h-5 w-5" />
        Fetch Product Details
      </Button>
    </form>
  );
}
