import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { RotateCw, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
  src: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCrop, onCancel }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 70,
    height: 70,
    x: 15,
    y: 15
  });
  
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Always lock the aspect ratio to 1:1 to ensure a perfect circle
  useEffect(() => {
    if (crop.width !== crop.height) {
      const size = Math.min(crop.width, crop.height);
      setCrop(prev => ({
        ...prev,
        width: size,
        height: size
      }));
    }
  }, [crop.width, crop.height]);

  const rotateImage = useCallback((degrees: number) => {
    setRotation(prev => {
      const newRotation = (prev + degrees) % 360;
      return newRotation < 0 ? newRotation + 360 : newRotation;
    });
  }, []);

  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    
    // Step 1: Create two canvases - one for initial crop and one for final circular crop
    const cropCanvas = document.createElement('canvas');
    const finalCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    const finalCtx = finalCanvas.getContext('2d');
    
    if (!cropCtx || !finalCtx) return;

    // Step 2: Determine the crop dimensions - use the smaller dimension for perfect circle
    const diameter = Math.min(completedCrop.width, completedCrop.height);
    
    // Calculate the scaling from displayed image to original
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Calculate source coordinates in original image dimensions
    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;
    const sourceWidth = diameter * scaleX;
    const sourceHeight = diameter * scaleY;

    // Step 3: Handle rotation in the crop canvas
    const maxSize = Math.max(image.naturalWidth, image.naturalHeight) * 2;
    cropCanvas.width = maxSize;
    cropCanvas.height = maxSize;
    
    // Center of temp canvas
    const centerX = maxSize / 2;
    const centerY = maxSize / 2;
    
    // Apply rotation
    cropCtx.translate(centerX, centerY);
    cropCtx.rotate((rotation * Math.PI) / 180);
    cropCtx.drawImage(
      image,
      -image.naturalWidth / 2,
      -image.naturalHeight / 2,
      image.naturalWidth,
      image.naturalHeight
    );
    
    // Reset transform
    cropCtx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Step 4: Set up the final canvas for the circular crop
    finalCanvas.width = diameter;
    finalCanvas.height = diameter;
    
    // Create circular clipping path
    finalCtx.beginPath();
    finalCtx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2);
    finalCtx.closePath();
    finalCtx.clip();
    
    // Step 5: Calculate where the crop should be on the rotated image
    // Calculate image center
    const imgCenterX = centerX;
    const imgCenterY = centerY;
    
    // Calculate crop center in original image
    const originalCropCenterX = sourceX + sourceWidth / 2;
    const originalCropCenterY = sourceY + sourceHeight / 2;
    
    // Calculate how the crop center moves with rotation
    const rad = rotation * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    // Calculate the rotated position
    // For no rotation, we simply take the center of original image + offset to crop center
    // For rotation, we need to calculate where this point moves
    let rotatedX = imgCenterX;
    let rotatedY = imgCenterY;
    
    // If we have rotation, calculate the rotated position
    if (rotation !== 0) {
      // Offset from image center
      const offsetX = originalCropCenterX - image.naturalWidth / 2;
      const offsetY = originalCropCenterY - image.naturalHeight / 2;
      
      // Apply rotation math to find where the center point moved
      rotatedX = imgCenterX + (offsetX * Math.cos(rad) - offsetY * Math.sin(rad));
      rotatedY = imgCenterY + (offsetX * Math.sin(rad) + offsetY * Math.cos(rad));
    } else {
      // For no rotation, we're simply looking at the offset from center
      rotatedX = imgCenterX - image.naturalWidth / 2 + originalCropCenterX;
      rotatedY = imgCenterY - image.naturalHeight / 2 + originalCropCenterY;
    }
    
    // Step 6: Draw from the rotated canvas onto our final circular canvas
    finalCtx.drawImage(
      cropCanvas,
      rotatedX - sourceWidth / 2,
      rotatedY - sourceHeight / 2,
      sourceWidth,
      sourceHeight,
      0,
      0,
      diameter,
      diameter
    );
    
    // Step 7: Convert to high-quality JPEG
    const base64Image = finalCanvas.toDataURL('image/jpeg', 1.0);
    onCrop(base64Image);
  }, [completedCrop, imgRef, rotation, onCrop]);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-[90vw] max-h-[90vh] overflow-hidden">
      <h3 className="text-lg font-medium mb-4">Crop Image</h3>
      <div className="flex flex-col items-center">
        <div className="max-h-[60vh] max-w-full overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop={true}
            keepSelection={true}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              className="max-h-[60vh] max-w-full object-contain"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </ReactCrop>
        </div>
        
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={() => rotateImage(-90)}
            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
            title="Rotate counter-clockwise"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={() => rotateImage(90)}
            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
            title="Rotate clockwise"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Hidden canvas for preview */}
      <canvas
        ref={previewCanvasRef}
        style={{
          display: 'none',
          borderRadius: '50%',
        }}
      />
      
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={getCroppedImg}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
