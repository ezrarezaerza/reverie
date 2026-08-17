import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface BentoGridAnimationsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * BentoGridAnimations:
 * Wraps dashboard & card grids with tactile GSAP micro-interactions:
 * 1. Staggered entrance on mount (opacity: 0, y: 30, stagger: 0.08, power2.out)
 * 2. Somatosensory hover lifting effect to simulate picking up physical paper
 */
export const BentoGridAnimations: React.FC<BentoGridAnimationsProps> = ({
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const cards = containerRef.current.querySelectorAll('.bento-card-item');

      if (cards.length > 0) {
        // Staggered entrance animation
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 28,
            scale: 0.98,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'transform',
          }
        );

        // Tactile paper lift hover interactions
        cards.forEach((card) => {
          const handleMouseEnter = () => {
            gsap.to(card, {
              scale: 1.012,
              y: -3,
              duration: 0.22,
              ease: 'power2.out',
              boxShadow: '0 12px 24px -6px rgba(35, 25, 15, 0.12), 0 4px 8px -2px rgba(35, 25, 15, 0.06)',
            });
          };

          const handleMouseLeave = () => {
            gsap.to(card, {
              scale: 1,
              y: 0,
              duration: 0.25,
              ease: 'power2.out',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(40,30,20,0.06)',
            });
          };

          card.addEventListener('mouseenter', handleMouseEnter);
          card.addEventListener('mouseleave', handleMouseLeave);
        });
      }
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
