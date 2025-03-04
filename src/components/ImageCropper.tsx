
import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    aspect: 1
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((img: HTMLImageElement) => {
    const aspect = 1;
    const { width, height } = img;
    const smallerDimension = Math.min(width, height);
    const x = (width - smallerDimension) / 2;
    const y = (height - smallerDimension) / 2;
    
    setCrop({
      unit: 'px',
      width: smallerDimension,
      height: smallerDimension,
      x,
      y,
      aspect
    });
    
    return false;
  }, []);

  const cropImage = () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a pixel-perfect crop
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    // Convert to base64 and pass to parent
    const base64Image = canvas.toDataURL('image/jpeg');
    onCropComplete(base64Image);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Crop Image</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Drag to adjust the crop area. The image will be cropped as a square.</p>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
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
              onLoad={(e) => onImageLoad(e.currentTarget)}
              className="max-w-full max-h-[60vh] object-contain"
            />
          </ReactCrop>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={cropImage}
            className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
