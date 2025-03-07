
import React, { useState, useRef, useCallback } from 'react';
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
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const rotateImage = useCallback((degrees: number) => {
    setRotation(prev => {
      const newRotation = (prev + degrees) % 360;
      return newRotation < 0 ? newRotation + 360 : newRotation;
    });
  }, []);

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save the current context state
    ctx.save();
    
    // Translate to the center of the canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Rotate the canvas by the specified rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw the image at its rotated position
    ctx.drawImage(
      imgRef.current,
      (completedCrop.x * scaleX) - (imgRef.current.naturalWidth / 2),
      (completedCrop.y * scaleY) - (imgRef.current.naturalHeight / 2),
      imgRef.current.naturalWidth,
      imgRef.current.naturalHeight,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    
    // Restore the context state
    ctx.restore();

    const base64Image = canvas.toDataURL('image/jpeg');
    onCrop(base64Image);
  };

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
            circularCrop
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
