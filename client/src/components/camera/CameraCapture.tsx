import { useState, useRef, useEffect } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

interface CameraCaptureProps {
  title: string;
  mealId: number;
  type: "before" | "after";
  onSuccess?: () => void;
  onCancel: () => void;
}

export default function CameraCapture({
  title,
  mealId,
  type,
  onSuccess,
  onCancel,
}: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please allow camera permissions.");
      }
    };

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            await uploadPhoto(file);
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  const uploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    setUploading(true);

    try {
      const endpoint = `/api/meals/${mealId}/${type}-photo`;
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      console.log("Photo uploaded successfully");

      // ✅ Trigger refetch of meal data
      queryClient.invalidateQueries();

      onSuccess?.();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Photo upload failed.");
    } finally {
      setUploading(false);
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
            <img src={capturedImage} alt="Captured" className="w-full rounded-lg" />
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
              disabled={uploading}
            >
              <Camera className="h-6 w-6" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
