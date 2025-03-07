
import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { RotateCw, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  src: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCrop, onCancel }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const rotateImage = (direction: 'clockwise' | 'counterclockwise') => {
    const increment = direction === 'clockwise' ? 90 : -90;
    setRotation((prev) => (prev + increment) % 360);
  };

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the cropped image to the canvas
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Image = canvas.toDataURL('image/jpeg');
    onCrop(base64Image);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
      <h3 className="text-lg font-medium mb-4">Crop & Rotate Image</h3>
      
      <div className="max-h-[60vh] overflow-hidden">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={1}
          circularCrop
        >
          <img
            ref={imgRef}
            src={src}
            alt="Crop preview"
            style={{ 
              maxHeight: '50vh',
              maxWidth: '100%', 
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
            className="object-contain mx-auto"
          />
        </ReactCrop>
      </div>
      
      <div className="flex justify-center mt-2 mb-4 space-x-4">
        <Button 
          onClick={() => rotateImage('counterclockwise')} 
          variant="outline" 
          size="sm"
          className="flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-1" /> Rotate Left
        </Button>
        <Button 
          onClick={() => rotateImage('clockwise')} 
          variant="outline" 
          size="sm"
          className="flex items-center"
        >
          <RotateCw className="h-4 w-4 mr-1" /> Rotate Right
        </Button>
      </div>
      
      <div className="flex justify-end mt-4 space-x-2">
        <Button
          onClick={onCancel}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          onClick={getCroppedImg}
          variant="default"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper;
