import React from 'react';

interface CoffeeTableIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/** 茶几／邊桌圖示，風格對齊 lucide-react */
export const CoffeeTableIcon: React.FC<CoffeeTableIconProps> = ({
  size = 24,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M6 12v7" />
    <path d="M18 12v7" />
  </svg>
);
