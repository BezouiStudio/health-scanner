
'use client';

import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Search, CameraOff, ScanEye, VideoOff } from 'lucide-react';
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

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // null: unknown, true: granted, false: denied/error
  const [isScannerInitializing, setIsScannerInitializing] = useState(true);
  const [scanFeedback, setScanFeedback] = useState<string | null>('Initializing scanner...');
  const [isScanSuccessful, setIsScanSuccessful] = useState(false);


  useEffect(() => {
    isMountedRef.current = true;

    const startScanning = async () => {
      if (!isMountedRef.current) return;
      
      setIsScannerInitializing(true);
      setIsScanSuccessful(false); // Reset scan success state
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
          // The `autoPlay` attribute on the <video> tag will attempt to play it.
          // We listen for `onloadedmetadata` to confirm readiness.

          videoRef.current.onloadedmetadata = async () => {
            if (!isMountedRef.current || !videoRef.current || isScanSuccessful) {
              // If component unmounted, video ref gone, or scan already happened, stop.
               if (videoRef.current?.srcObject) { // Clean up stream if we bail early
                  const activeStream = videoRef.current.srcObject as MediaStream;
                  activeStream.getTracks().forEach(track => track.stop());
                  videoRef.current.srcObject = null;
              }
              return;
            }

            if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
              console.warn("Video metadata loaded, but dimensions are zero.");
              if (isMountedRef.current && !isScanSuccessful) {
                setScanFeedback("Video stream has an issue (zero dimensions). Try refreshing.");
                setIsScannerInitializing(false);
                setHasCameraPermission(true); // Permission was granted, but video is not usable
              }
              return; 
            }
            
            try {
              // Ensure video is playing. autoPlay might have handled it. If not, play() explicitly.
              if (videoRef.current.paused) {
                await videoRef.current.play();
              }

              // Now, video should be playing and have dimensions.
              if (isMountedRef.current && !isScanSuccessful) {
                setHasCameraPermission(true);
                setIsScannerInitializing(false);
                setScanFeedback("Scanner active. Point camera at a barcode.");

                const controls = await codeReader.current.decodeContinuously(
                  videoRef.current,
                  (result, decodeError) => {
                    if (!isMountedRef.current || isScanSuccessful) {
                      // If controls were created, they should be stopped by the main cleanup or success path.
                      return;
                    }

                    if (result) {
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
                    } else if (decodeError) {
                      if (decodeError instanceof NotFoundException) {
                        if (!isScanSuccessful && videoRef.current?.srcObject) {
                           setScanFeedback("Searching for barcode...");
                        }
                      } else {
                        // More serious error during decoding, but not necessarily a setup error
                        console.error('Barcode scan error (not NotFoundException):', decodeError);
                        // Potentially set a scanFeedback message here too
                      }
                    }
                  }
                );
                if (isMountedRef.current) {
                    controlsRef.current = controls;
                } else {
                    controls.stop(); // Stop immediately if unmounted during setup
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
              setHasCameraPermission(false); // Indicate camera is not usable
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
        // videoRef.current.pause(); // Not strictly necessary if srcObject is nulled and tracks stopped
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

  // Determine video visibility:
  // Show if permission granted, not initializing, not yet successfully scanned, and video srcObject is present.
  const videoActuallyVisible = hasCameraPermission === true && !isScannerInitializing && !isScanSuccessful && videoRef.current?.srcObject;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border relative overflow-hidden shadow-inner">
        {(isScannerInitializing && hasCameraPermission === null) && ( // Initial permission request phase
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-10 p-4 text-center">
            <ScanEye className="w-16 h-16 text-primary animate-pulse mb-3" />
            <p className="text-muted-foreground">{scanFeedback || 'Requesting camera...'}</p>
            <Skeleton className="w-full h-full absolute inset-0 bg-muted/50" />
          </div>
        )}
        
        <video 
          ref={videoRef} 
          className={`w-full h-full object-cover rounded-md ${videoActuallyVisible ? '' : 'hidden'}`} 
          autoPlay 
          muted 
          playsInline
          aria-label="Camera feed for barcode scanning"
         />

        {(!isScannerInitializing && hasCameraPermission === false) && ( // Permission denied or camera error
           <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <CameraOff className="w-16 h-16 text-destructive mb-3" />
            <p className="text-destructive font-semibold">Camera Unavailable</p>
            <p className="text-muted-foreground text-sm max-w-xs">
              {scanFeedback || "Could not access camera. Check permissions or use manual input."}
            </p>
          </div>
        )}

        {(hasCameraPermission === true && !isScannerInitializing && !isScanSuccessful && !videoRef.current?.srcObject) && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <VideoOff className="w-16 h-16 text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-semibold">Video Stream Ended</p>
                <p className="text-muted-foreground text-sm max-w-xs">
                 The camera stream has stopped. This can happen if the scan was completed or if there was an issue.
                </p>
            </div>
        )}
        
        {(!isScannerInitializing && hasCameraPermission === true && isScanSuccessful) && ( // Scan was successful
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-background/95">
                <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
                <p className="text-primary font-semibold">Scan Successful!</p>
                <p className="text-muted-foreground text-sm max-w-xs">
                    {scanFeedback || `Detected: ${barcode}`}
                </p>
                <p className="text-xs text-muted-foreground mt-2">You can now submit or edit the barcode below.</p>
            </div>
        )}
      </div>
      
      {scanFeedback && (hasCameraPermission !== null || isScanSuccessful) && (
         <p className={`text-sm text-center -mt-2 ${hasCameraPermission === false ? 'text-destructive' : 'text-muted-foreground'}`}>
            {scanFeedback}
        </p>
       )}


      <div>
        <label htmlFor="barcode-input" className="block text-sm font-medium text-foreground mb-1.5">
          Enter Barcode Manually or Edit Scanned Barcode
        </label>
        <Input
          id="barcode-input"
          type="text"
          value={barcode}
          onChange={(e) => {
            setBarcode(e.target.value);
            if (error) setError(null);
            // If user types, it implies they might want to override the scan or current state.
            // We don't need to restart scanning if they type manually after a successful scan.
            // If they clear the input after a successful scan, isScanSuccessful should ideally reset
            // if we wanted to allow re-scanning, but current logic is fine.
          }}
          placeholder="e.g., 1234567890123"
          className="text-lg py-3 h-auto"
          aria-label="Enter or edit barcode"
          // Input is typically enabled unless scanner is in its very initial permission request phase.
          disabled={isScannerInitializing && hasCameraPermission === null} 
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
        // Button should be enabled if there's a barcode, regardless of scanner state,
        // unless in absolute initial state.
        disabled={!barcode.trim() || (isScannerInitializing && hasCameraPermission === null)}
      >
        <Search className="mr-2 h-5 w-5" />
        Fetch Product Details
      </Button>
    </form>
  );
}

