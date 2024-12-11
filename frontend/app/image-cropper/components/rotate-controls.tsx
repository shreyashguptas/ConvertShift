'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw } from 'lucide-react';

interface RotateControlsProps {
  onRotate: (direction: 'left' | 'right') => void;
}

export function RotateControls({ onRotate }: RotateControlsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onRotate('left')}
        title="Rotate Left"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onRotate('right')}
        title="Rotate Right"
      >
        <RotateCw className="h-4 w-4" />
      </Button>
    </div>
  );
} 