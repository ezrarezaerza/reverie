import React from 'react';

export const NoiseOverlay: React.FC = () => {
  return (
    <>
      {/* Heavy Organic Risograph & Paper Grain Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.08] dark:opacity-[0.06] mix-blend-multiply dark:mix-blend-screen select-none"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='risoNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.25 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23risoNoise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '160px 160px',
        }}
      />

      {/* Organic Paper Pulp Flecks & Micro-Fiber Texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.05] dark:opacity-[0.035] mix-blend-multiply dark:mix-blend-overlay select-none"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='pulpSpecks'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.04' numOctaves='2' result='noise'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.15  0 0 0 0 0.12  0 0 0 0 0.08  0 0 0 25 -19'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23pulpSpecks)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 400px',
        }}
      />
    </>
  );
};
