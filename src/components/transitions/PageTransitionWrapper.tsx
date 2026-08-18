import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
  transitionKey: string;
  className?: string;
  variant?: 'pageFlip' | 'folioSlide' | 'gentleFade';
}

/**
 * Tactile Page Transition Engine (GSAP power2.out)
 * Simulates physical paper turning, notebook flip, and folio desk transitions.
 * Automatically respects user's prefers-reduced-motion setting.
 */
export const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({
  children,
  transitionKey,
  className = '',
  variant = 'pageFlip'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(containerRef.current, { opacity: 1, y: 0, scale: 1, rotateY: 0 });
      return;
    }

    if (variant === 'pageFlip') {
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          y: 10,
          scale: 0.985,
          transformPerspective: 1000,
          rotateX: 1
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.36,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        }
      );
    } else if (variant === 'folioSlide') {
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          x: 16,
          scale: 0.99
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.32,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        }
      );
    } else {
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          y: 6
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.28,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        }
      );
    }
  }, [transitionKey, variant]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
