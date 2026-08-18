import React from 'react';

interface ScallopStampProps {
  dayNumber?: number | string;
  isFilled?: boolean;
  isSelected?: boolean;
  isToday?: boolean;
  variant?: 'ochre' | 'sage' | 'terracotta' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
}

// Generate an exact 12-lobed scalloped sunburst rosette path
export const generate12LobedScallopPath = (
  cx: number = 24,
  cy: number = 24,
  rIn: number = 17,
  petalRadius: number = 5.2
): string => {
  const lobes = 12;
  const angleStep = (2 * Math.PI) / lobes;
  const startAngle = -Math.PI / 2 - angleStep / 2;

  const startX = cx + rIn * Math.cos(startAngle);
  const startY = cy + rIn * Math.sin(startAngle);

  let d = `M ${startX.toFixed(2)} ${startY.toFixed(2)}`;

  for (let i = 0; i < lobes; i++) {
    const endAngle = startAngle + (i + 1) * angleStep;
    const endX = cx + rIn * Math.cos(endAngle);
    const endY = cy + rIn * Math.sin(endAngle);
    d += ` A ${petalRadius.toFixed(2)} ${petalRadius.toFixed(2)} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  }

  d += ' Z';
  return d;
};

const SCALLOP_PATH = generate12LobedScallopPath(24, 24, 16.5, 4.8);

export const ScallopStamp: React.FC<ScallopStampProps> = ({
  dayNumber,
  isFilled = false,
  isSelected = false,
  isToday = false,
  variant = 'ochre',
  size = 'md',
  className = '',
  onClick,
  title,
  disabled = false,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm',
    lg: 'w-11 h-11 sm:w-12 sm:h-12 text-sm sm:text-base',
  };

  const getVariantFillColor = () => {
    switch (variant) {
      case 'sage':
        return 'text-[#48735B] dark:text-[#528A6D]';
      case 'terracotta':
        return 'text-[#C85A48] dark:text-[#E06E5B]';
      case 'amber':
        return 'text-[#D98E32] dark:text-[#E5A046]';
      case 'ochre':
      default:
        return 'text-[#E5A338] dark:text-[#DEAC5D]';
    }
  };

  const getVariantBgFill = () => {
    switch (variant) {
      case 'sage':
        return '#48735B';
      case 'terracotta':
        return '#C85A48';
      case 'amber':
        return '#D98E32';
      case 'ochre':
      default:
        return '#E5A338';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`relative inline-flex items-center justify-center select-none group transition-transform ${
        sizeClasses[size]
      } ${disabled ? 'opacity-25 pointer-events-none' : 'cursor-pointer'} ${
        isSelected ? 'scale-105' : 'hover:scale-105 active:scale-95'
      } ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full absolute inset-0 drop-shadow-2xs transition-all"
      >
        {isFilled ? (
          // Filled Scalloped Rosette Stamp (Matching reference "Outdoor jogs in July")
          <g>
            <path
              d={SCALLOP_PATH}
              fill={getVariantBgFill()}
              stroke={isSelected ? '#1C355E' : 'rgba(0,0,0,0.12)'}
              strokeWidth={isSelected ? '2.5' : '1'}
              strokeLinejoin="round"
            />
            {/* Subtle inner tactile ring */}
            <circle
              cx="24"
              cy="24"
              r="12"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeDasharray="2 2"
              strokeWidth="0.8"
            />
          </g>
        ) : (
          // Scalloped Outline Stamp (Unrecorded or subtle day slot)
          <path
            d={SCALLOP_PATH}
            fill={isSelected ? 'rgba(230, 220, 200, 0.4)' : 'transparent'}
            stroke={
              isSelected
                ? '#1C355E'
                : isToday
                ? '#A8382A'
                : 'currentColor'
            }
            strokeWidth={isSelected ? '2' : isToday ? '1.8' : '1.2'}
            strokeDasharray={isToday ? undefined : '2.5 1.5'}
            className={
              isSelected
                ? 'text-[#1C355E] dark:text-[#9EC0F4]'
                : isToday
                ? 'text-[#A8382A] dark:text-[#F08A7D]'
                : 'text-[#D0C2AD] dark:text-[#425248] group-hover:text-[#B5A58D]'
            }
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Center Day Number or Stamp Content */}
      <span
        className={`relative z-10 font-bold leading-none font-display tracking-tight transition-colors ${
          isFilled
            ? 'text-[#FAF8F2] font-extrabold drop-shadow-xs'
            : isSelected
            ? 'text-[#1C355E] dark:text-[#9EC0F4] font-extrabold'
            : isToday
            ? 'text-[#A8382A] dark:text-[#F08A7D] font-black'
            : 'text-[#504739] dark:text-[#C5BBAE] group-hover:text-[#231E18]'
        }`}
      >
        {dayNumber}
      </span>

      {/* Tiny red/rust dot for today if not selected */}
      {isToday && !isFilled && (
        <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#A8382A] dark:bg-[#F08A7D]" />
      )}
    </button>
  );
};
