import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 24, className = "" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#insta-yt-grad)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <linearGradient id="insta-yt-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      
      {/* Instagram outer box */}
      <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" />
      
      {/* Instagram dot */}
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="3" strokeLinecap="round" />
      
      {/* YouTube Play Triangle */}
      <polygon points="10 8 16 12 10 16" fill="url(#insta-yt-grad)" strokeWidth="1" />
    </svg>
  );
}
