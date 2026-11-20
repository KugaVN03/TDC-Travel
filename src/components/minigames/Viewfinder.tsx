import React from 'react';
import { RotateCw, X } from 'lucide-react';
import { Station } from '../../types/game';

interface ViewfinderProps {
  station: Station | null;
  onRotate: () => void;
  onCapture: () => void;
  onCancel: () => void;
}

export const Viewfinder: React.FC<ViewfinderProps> = ({
  station,
  onRotate,
  onCapture,
  onCancel,
}) => {
  if (!station) return null;

  return (
    <div id="viewfinder">
      <div className="fr" />
      <div className="cap">{station.name} · TDC GO 3D Polaroid</div>
      <div className="vf-btns">
        <button
          type="button"
          className="vf-small"
          onClick={onRotate}
          title="Xoay góc chụp"
          aria-label="Xoay góc chụp"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="shutter"
          onClick={onCapture}
          title="Chụp ảnh"
          aria-label="Chụp ảnh"
        />
        <button
          type="button"
          className="vf-small"
          onClick={onCancel}
          title="Hủy chụp"
          aria-label="Hủy chụp"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
