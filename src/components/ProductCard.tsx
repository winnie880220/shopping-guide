import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOpen: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
  showAiBadge?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpen,
  onAddToCart,
  showAiBadge = false,
}) => (
  <div className="flex flex-col group">
    <div
      onClick={onOpen}
      className="aspect-square bg-gray-50 rounded-2xl mb-3 overflow-hidden relative cursor-pointer border border-gray-50"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
      />
      {showAiBadge && product.aiReason && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-white/80 backdrop-blur-md px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-[8px] font-black leading-tight text-gray-900 line-clamp-1">
              <span className="text-gray-400 mr-1">✦</span>
              {product.aiReason}
            </p>
          </div>
        </div>
      )}
    </div>
    <div className="px-1">
      <h3 className="text-[13px] font-semibold leading-tight mb-0.5 truncate text-gray-900">
        {product.name}
      </h3>
      <p className="text-[10px] text-gray-400 mb-2 line-clamp-2 leading-snug">{product.description}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-900">
          NT$ {product.price.toLocaleString()}
        </span>
        <button
          type="button"
          onClick={onAddToCart}
          aria-label={`將 ${product.name} 加入購物車`}
          className="bg-gray-900 text-white p-1.5 rounded-lg shadow-sm active:scale-95 transition-transform flex-shrink-0"
        >
          <ShoppingCart size={12} />
        </button>
      </div>
    </div>
  </div>
);
