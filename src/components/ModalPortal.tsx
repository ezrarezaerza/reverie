import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * ModalPortal:
 * Renders modal overlays directly into `document.body` after component mounting.
 * This breaks out of any parent CSS transforms, GSAP animations, or overflow clipping,
 * while safely preventing "Target container is not a DOM element" errors.
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined' || !document.body) {
    return null;
  }

  return createPortal(children, document.body);
};
