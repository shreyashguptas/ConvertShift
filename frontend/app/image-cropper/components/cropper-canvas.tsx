'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

interface CropperCanvasProps {
  image: string;
  rotation: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  handle: string | null;
  initialCrop: CropArea;
}

interface CropperCanvasRef {
  canvas: HTMLCanvasElement | null;
  getCroppedImage: () => HTMLCanvasElement | null;
}

export const CropperCanvas = forwardRef<CropperCanvasRef, CropperCanvasProps>(
  function CropperCanvas({ image, rotation }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
    const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
    const [dragState, setDragState] = useState<DragState>({
      isDragging: false,
      startX: 0,
      startY: 0,
      handle: null,
      initialCrop: { x: 0, y: 0, width: 0, height: 0 },
    });
    const [cursor, setCursor] = useState<string>('default');

    const getCroppedImage = useCallback(() => {
      if (!canvasRef.current || !imageObj) return null;

      // Create a temporary canvas for the cropped image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return null;

      // Set the temporary canvas size to match the crop area
      tempCanvas.width = cropArea.width;
      tempCanvas.height = cropArea.height;

      // Save context state
      tempCtx.save();

      // Draw only the cropped portion of the image
      if (rotation !== 0) {
        // If rotated, we need to handle the rotation
        tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
        tempCtx.rotate((rotation * Math.PI) / 180);
        tempCtx.translate(-tempCanvas.width / 2, -tempCanvas.height / 2);
      }

      // Calculate the scale of the image
      const canvas = canvasRef.current;
      const scale = canvas.width / imageObj.width;

      // Draw the cropped portion
      tempCtx.drawImage(
        imageObj,
        cropArea.x / scale,
        cropArea.y / scale,
        cropArea.width / scale,
        cropArea.height / scale,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      // Restore context state
      tempCtx.restore();

      return tempCanvas;
    }, [imageObj, cropArea, rotation]);

    const drawImage = useCallback(() => {
      if (!canvasRef.current || !imageObj) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear the entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // First, draw the image
      ctx.save();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Create a semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      ctx.fill('evenodd');

      // Draw crop border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      // Draw handles
      const handleSize = 8;
      const handles = [
        { x: cropArea.x, y: cropArea.y, cursor: 'nw-resize' }, // Top-left
        { x: cropArea.x + cropArea.width, y: cropArea.y, cursor: 'ne-resize' }, // Top-right
        { x: cropArea.x, y: cropArea.y + cropArea.height, cursor: 'sw-resize' }, // Bottom-left
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height, cursor: 'se-resize' }, // Bottom-right
        { x: cropArea.x + cropArea.width / 2, y: cropArea.y, cursor: 'n-resize' }, // Top
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height / 2, cursor: 'e-resize' }, // Right
        { x: cropArea.x + cropArea.width / 2, y: cropArea.y + cropArea.height, cursor: 's-resize' }, // Bottom
        { x: cropArea.x, y: cropArea.y + cropArea.height / 2, cursor: 'w-resize' }, // Left
      ];

      handles.forEach(({ x, y }) => {
        // Draw white handle with black border
        ctx.fillStyle = 'white';
        ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
      });
    }, [imageObj, rotation, cropArea]);

    // Initialize image and canvas
    useEffect(() => {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        if (containerRef.current && canvasRef.current) {
          const container = containerRef.current;
          const canvas = canvasRef.current;

          // Calculate the scale to fit the image within the container
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          const scale = Math.min(
            containerWidth / img.width,
            containerHeight / img.height
          );

          // Set canvas size to match scaled image dimensions
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          canvas.width = scaledWidth;
          canvas.height = scaledHeight;

          // Initialize crop area to match image boundaries
          setCropArea({
            x: 0,
            y: 0,
            width: scaledWidth,
            height: scaledHeight,
          });

          setImageObj(img);
        }
      };
    }, [image]);

    // Redraw when image, rotation, or crop area changes
    useEffect(() => {
      if (imageObj) {
        drawImage();
      }
    }, [imageObj, rotation, cropArea, drawImage]);

    const getHandleAtPosition = useCallback((x: number, y: number): { handle: string | null; cursor: string } => {
      const handleSize = 8;
      const { x: cropX, y: cropY, width: cropWidth, height: cropHeight } = cropArea;

      // Helper function to check if point is near a position
      const isNear = (px: number, py: number) => 
        Math.abs(x - px) <= handleSize && Math.abs(y - py) <= handleSize;

      // Check corners
      if (isNear(cropX, cropY)) return { handle: 'top-left', cursor: 'nw-resize' };
      if (isNear(cropX + cropWidth, cropY)) return { handle: 'top-right', cursor: 'ne-resize' };
      if (isNear(cropX, cropY + cropHeight)) return { handle: 'bottom-left', cursor: 'sw-resize' };
      if (isNear(cropX + cropWidth, cropY + cropHeight)) return { handle: 'bottom-right', cursor: 'se-resize' };

      // Check sides
      if (isNear(cropX + cropWidth / 2, cropY)) return { handle: 'top', cursor: 'n-resize' };
      if (isNear(cropX + cropWidth, cropY + cropHeight / 2)) return { handle: 'right', cursor: 'e-resize' };
      if (isNear(cropX + cropWidth / 2, cropY + cropHeight)) return { handle: 'bottom', cursor: 's-resize' };
      if (isNear(cropX, cropY + cropHeight / 2)) return { handle: 'left', cursor: 'w-resize' };

      return { handle: null, cursor: 'default' };
    }, [cropArea]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (dragState.isDragging && dragState.handle) {
        const dx = x - dragState.startX;
        const dy = y - dragState.startY;
        const { initialCrop, handle } = dragState;

        let newCrop = { ...cropArea };

        switch (handle) {
          case 'top-left':
            newCrop = {
              x: Math.min(initialCrop.x + dx, initialCrop.x + initialCrop.width - 10),
              y: Math.min(initialCrop.y + dy, initialCrop.y + initialCrop.height - 10),
              width: Math.max(initialCrop.width - dx, 10),
              height: Math.max(initialCrop.height - dy, 10),
            };
            break;
          case 'top-right':
            newCrop = {
              x: initialCrop.x,
              y: Math.min(initialCrop.y + dy, initialCrop.y + initialCrop.height - 10),
              width: Math.max(initialCrop.width + dx, 10),
              height: Math.max(initialCrop.height - dy, 10),
            };
            break;
          case 'bottom-left':
            newCrop = {
              x: Math.min(initialCrop.x + dx, initialCrop.x + initialCrop.width - 10),
              y: initialCrop.y,
              width: Math.max(initialCrop.width - dx, 10),
              height: Math.max(initialCrop.height + dy, 10),
            };
            break;
          case 'bottom-right':
            newCrop = {
              x: initialCrop.x,
              y: initialCrop.y,
              width: Math.max(initialCrop.width + dx, 10),
              height: Math.max(initialCrop.height + dy, 10),
            };
            break;
          case 'top':
            newCrop = {
              ...initialCrop,
              y: Math.min(initialCrop.y + dy, initialCrop.y + initialCrop.height - 10),
              height: Math.max(initialCrop.height - dy, 10),
            };
            break;
          case 'right':
            newCrop = {
              ...initialCrop,
              width: Math.max(initialCrop.width + dx, 10),
            };
            break;
          case 'bottom':
            newCrop = {
              ...initialCrop,
              height: Math.max(initialCrop.height + dy, 10),
            };
            break;
          case 'left':
            newCrop = {
              ...initialCrop,
              x: Math.min(initialCrop.x + dx, initialCrop.x + initialCrop.width - 10),
              width: Math.max(initialCrop.width - dx, 10),
            };
            break;
        }

        // Ensure crop area stays within canvas bounds
        newCrop.x = Math.max(0, Math.min(newCrop.x, canvas.width - newCrop.width));
        newCrop.y = Math.max(0, Math.min(newCrop.y, canvas.height - newCrop.height));
        newCrop.width = Math.min(newCrop.width, canvas.width - newCrop.x);
        newCrop.height = Math.min(newCrop.height, canvas.height - newCrop.y);

        setCropArea(newCrop);
      } else {
        const { cursor } = getHandleAtPosition(x, y);
        setCursor(cursor);
      }
    }, [cropArea, dragState, getHandleAtPosition]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { handle } = getHandleAtPosition(x, y);
      if (handle) {
        setDragState({
          isDragging: true,
          startX: x,
          startY: y,
          handle,
          initialCrop: { ...cropArea },
        });
      }
    }, [cropArea, getHandleAtPosition]);

    const handleMouseUp = useCallback(() => {
      setDragState({
        isDragging: false,
        startX: 0,
        startY: 0,
        handle: null,
        initialCrop: { x: 0, y: 0, width: 0, height: 0 },
      });
    }, []);

    // Forward the canvas ref and expose getCroppedImage method
    useEffect(() => {
      if (ref && typeof ref === 'object') {
        ref.current = {
          canvas: canvasRef.current,
          getCroppedImage,
        };
      }
    }, [ref, getCroppedImage]);

    return (
      <div ref={containerRef} className="relative w-full h-[500px] bg-black">
        <canvas
          ref={canvasRef}
          style={{ cursor }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    );
  }
); 