import React from 'react';

interface OtherFurnitureIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/** 其他家具：層架／收納櫃圖示，風格對齊 lucide-react */
export const OtherFurnitureIcon: React.FC<OtherFurnitureIconProps> = ({
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
    <rect x="4" y="5" width="16" height="14" rx="1.5" />
    <path d="M4 10h16" />
    <path d="M4 15h16" />
    <path d="M12 5v14" />
    <path d="M7 19v2" />
    <path d="M17 19v2" />
  </svg>
);
