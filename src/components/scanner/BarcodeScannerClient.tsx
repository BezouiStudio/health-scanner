'use client';

import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Search, CameraOff, ScanEye } from 'lucide-react';
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

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScannerInitializing, setIsScannerInitializing] = useState(true);
  const [scanFeedback, setScanFeedback] = useState<string | null>('Initializing scanner...');
  const [isScanSuccessful, setIsScanSuccessful] = useState(false);


  useEffect(() => {
    isMountedRef.current = true;

    const startScanning = async () => {
      if (!isMountedRef.current) return;
      setIsScannerInitializing(true);
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
          
          // Ensure video plays. Some browsers might block autoplay.
          try {
            await videoRef.current.play();
          } catch (playError) {
            console.error("Video play() failed:", playError);
            if (isMountedRef.current) {
              setScanFeedback("Could not start video playback. Please ensure autoplay is allowed.");
              setIsScannerInitializing(false);
              setHasCameraPermission(false);
              toast({ variant: 'destructive', title: 'Video Error', description: "Could not start video playback." });
            }
            return; // Stop further execution if video can't play
          }

          videoRef.current.onloadedmetadata = async () => {
            if (!isMountedRef.current || !videoRef.current || isScanSuccessful) return;

            if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
              console.warn("Video metadata loaded, but dimensions are still 0.");
              if (isMountedRef.current) {
                setScanFeedback("Video stream not ready (zero dimensions).");
                setIsScannerInitializing(false);
                // Consider setting hasCameraPermission to false or retrying
              }
              return;
            }
            
            if (isMountedRef.current) {
              setHasCameraPermission(true);
              setIsScannerInitializing(false);
              setScanFeedback("Scanner active. Point camera at a barcode.");
            }

            try {
              const controls = await codeReader.current.decodeContinuously(
                videoRef.current,
                (result, error) => {
                  if (!isMountedRef.current || isScanSuccessful) return;

                  if (result) {
                    const scannedBarcode = result.getText();
                    // Check if barcode state itself needs to be accessed carefully if it's a dependency
                    // For now, direct comparison should be fine as it's for preventing immediate re-scan
                    setBarcode(scannedBarcode); // Update state which might cause re-render
                    setScanFeedback(`Scanned: ${scannedBarcode}`);
                    setIsScanSuccessful(true);
                    toast({
                      title: 'Barcode Scanned!',
                      description: `Detected: ${scannedBarcode}`,
                      action: <CheckCircle className="text-green-500" />,
                    });
                    
                    if (controlsRef.current) { // Stop this specific continuous scan
                      controlsRef.current.stop(); 
                    }
                    // Reset for potential future scans if the component were to re-initiate
                    // codeReader.current.reset(); // Reset is important

                    streamTracksRef.current.forEach(track => track.stop());
                    streamTracksRef.current = [];
                    if (videoRef.current && videoRef.current.srcObject) {
                      videoRef.current.srcObject = null;
                    }
                  } else if (error && !(error instanceof NotFoundException)) {
                    console.error('Barcode scan error:', error);
                  } else if (error instanceof NotFoundException) {
                    if (!isScanSuccessful && videoRef.current?.srcObject) {
                         setScanFeedback("Searching for barcode...");
                    }
                  }
                }
              );
              if (isMountedRef.current) {
                  controlsRef.current = controls;
              } else {
                  controls.stop(); // Stop immediately if unmounted during setup
              }
            } catch (decodeError) {
              console.error("Error setting up continuous decoding:", decodeError);
              if (isMountedRef.current) {
                setScanFeedback("Error starting scanner detection.");
                setIsScannerInitializing(false);
              }
            }
          };

          videoRef.current.onerror = (e) => {
            console.error("Video element error:", e);
            if(isMountedRef.current) {
              setScanFeedback("Video element failed to load.");
              setIsScannerInitializing(false);
              setHasCameraPermission(false);
            }
          };
        }
      } catch (err: any) {
        console.error("Error initializing scanner:", err);
        if (isMountedRef.current) {
          let message = "Failed to initialize camera.";
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            message = "Camera permission denied. Please enable it in your browser settings.";
          } else if (err.message === "Camera API not supported in this browser.") {
            message = err.message;
          } else if (err.name === 'NotFoundError' || (err.message && (err.message.includes("Requested device not found") || err.message.includes("Could not get UserMedia")))) {
            message = "No camera found or camera is busy. Ensure it's connected and enabled.";
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
      codeReader.current.reset(); // Reset ZXing state on unmount
      
      streamTracksRef.current.forEach(track => track.stop());
      streamTracksRef.current = [];

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onerror = null;
        // No need to videoRef.current.pause() if srcObject is null, tracks are stopped
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run once on mount and clean up on unmount

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

  const videoVisible = !isScannerInitializing && hasCameraPermission === true && videoRef.current?.srcObject && !isScanSuccessful;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border relative overflow-hidden shadow-inner">
        {isScannerInitializing && hasCameraPermission === null && ( // Show only when truly initializing permission
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
          playsInline // Important for iOS
          aria-label="Camera feed for barcode scanning"
         />
        {!isScannerInitializing && hasCameraPermission === false && (
           <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <CameraOff className="w-16 h-16 text-destructive mb-3" />
            <p className="text-destructive font-semibold">Camera Unavailable</p>
            <p className="text-muted-foreground text-sm max-w-xs">
              {scanFeedback || "Could not access camera. Check permissions or use manual input."}
            </p>
          </div>
        )}
         {!isScannerInitializing && hasCameraPermission === true && isScanSuccessful && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-background/90">
                <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
                <p className="text-primary font-semibold">Scan Successful!</p>
                <p className="text-muted-foreground text-sm max-w-xs">
                    {scanFeedback || `Detected: ${barcode}`}
                </p>
            </div>
        )}
      </div>
      
      {scanFeedback && (!isScannerInitializing || hasCameraPermission === false) && (hasCameraPermission === true || isScanSuccessful || hasCameraPermission === false) && (
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
            // If user types, assume they want to override scan or previous success
            if (isScanSuccessful) setIsScanSuccessful(false); 
            // Potentially re-enable camera if it was stopped due to successful scan
            // This would require more complex state management to restart scanning.
            // For now, manual input overrides the "scan successful" state for the input field.
          }}
          placeholder="e.g., 1234567890123"
          className="text-lg py-3 h-auto"
          aria-label="Enter barcode manually"
          // Enable input if scanner is not initializing, or if camera permission failed, or if scan was successful (to allow edits)
          disabled={isScannerInitializing && hasCameraPermission !== false && !isScanSuccessful}
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
        disabled={!barcode.trim() || (isScannerInitializing && hasCameraPermission !== false && !isScanSuccessful)}
      >
        <Search className="mr-2 h-5 w-5" />
        Fetch Product Details
      </Button>
    </form>
  );
}

