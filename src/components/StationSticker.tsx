import React from 'react';
import {
  Camera,
  Check,
  Code2,
  Compass,
  Cpu,
  Flag,
  HelpCircle,
  Lock,
  Sparkles,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import { StationType } from '../types/game';

interface StationStickerProps {
  col: string;
  type: StationType | 'star' | 'explorer' | 'party' | 'medal' | 'trophy' | 'list';
  size?: number;
  locked?: boolean;
  done?: boolean;
}

export const StationSticker: React.FC<StationStickerProps> = ({
  col,
  type,
  size = 52,
  locked = false,
  done = false,
}) => {
  const renderIcon = () => {
    if (locked) return <Lock className="w-1/2 h-1/2" />;
    if (done) return <Check className="w-3/5 h-3/5 stroke-[3]" />;
    switch (type) {
      case 'checkin':
        return <Flag className="w-1/2 h-1/2" />;
      case 'photo':
        return <Camera className="w-1/2 h-1/2" />;
      case 'quiz':
        return <HelpCircle className="w-1/2 h-1/2" />;
      case 'kick':
        return <Trophy className="w-1/2 h-1/2" />;
      case 'it_debug':
        return <Code2 className="w-1/2 h-1/2" />;
      case 'electric_circuit':
        return <Cpu className="w-1/2 h-1/2" />;
      case 'auto_engine':
        return <Wrench className="w-1/2 h-1/2" />;
      case 'party':
        return <Users className="w-1/2 h-1/2" />;
      case 'explorer':
        return <Compass className="w-1/2 h-1/2" />;
      default:
        return <Sparkles className="w-1/2 h-1/2" />;
    }
  };

  return (
    <span
      className={`sticker ${locked ? 'off' : ''}`}
      style={
        {
          '--c': done ? '#3DAA5C' : col,
          width: `${size}px`,
          height: `${size}px`,
        } as React.CSSProperties
      }
    >
      {renderIcon()}
    </span>
  );
};
