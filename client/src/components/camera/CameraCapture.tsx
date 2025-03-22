import { useState, useRef, useEffect } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  title: string;
}

export default function CameraCapture({ 
  onCapture, 
  onCancel,
  title 
}: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Initialize camera when component mounts
    const setupCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" },
          audio: false 
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please make sure you've granted camera permissions.");
      }
    };
    
    setupCamera();
    
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext("2d");
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL and display preview
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        
        // Convert to Blob/File for upload
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
            // Pass file to parent component
            onCapture(file);
          }
        }, "image/jpeg", 0.9);
      }
    }
  };
  
  const handleClose = () => {
    setIsOpen(false);
    onCancel();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={handleClose}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <Button 
            variant="ghost" 
            className="absolute right-4 top-4 rounded-full p-2 h-auto" 
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex flex-col items-center">
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full rounded-lg" 
            />
          ) : (
            <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-[4/3]">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
          
          {!capturedImage && (
            <Button 
              className="mt-4 rounded-full h-14 w-14 p-0 bg-primary hover:bg-primary/90"
              onClick={handleCapture}
            >
              <Camera className="h-6 w-6" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
