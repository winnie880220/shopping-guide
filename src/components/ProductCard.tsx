import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';

function getCardTags(product: Product): string[] {
  if (product.variantTags?.length) return product.variantTags;
  return product.sizeDisplay ? [product.sizeDisplay] : [];
}

interface ProductCardProps {
  product: Product;
  onOpen: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
  showAiBadge?: boolean;
  compact?: boolean;
  /** 與 compact 搭配，用於橫向推薦列等較窄版面 */
  dense?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpen,
  onAddToCart,
  showAiBadge = false,
  compact = false,
  dense = false,
}) => {
  const cardTags = getCardTags(product);

  return (
  <div className="flex flex-col group">
    <div
      onClick={onOpen}
      className={`aspect-square bg-gray-50 overflow-hidden relative cursor-pointer border border-gray-50 ${
        compact
          ? dense
            ? 'rounded-lg mb-1.5'
            : 'rounded-xl mb-2'
          : 'rounded-2xl mb-3'
      }`}
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
    <div className={dense ? 'px-0.5' : 'px-1'}>
      <h3
        className={`font-medium leading-tight truncate text-gray-900 ${
          dense ? 'text-[11px] mb-0.5' : compact ? 'text-[13px] mb-1' : 'text-[13px] mb-1.5'
        }`}
      >
        {product.name}
      </h3>
      <div className={`flex items-end ${dense ? 'gap-1.5' : 'gap-2'}`}>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-gray-900 block">
            <span
              className={
                dense ? 'text-[10px]' : compact ? 'text-[11px]' : 'text-[12px]'
              }
            >
              NT$
            </span>{' '}
            <span
              className={
                dense ? 'text-[13px]' : compact ? 'text-[14px]' : 'text-[16px]'
              }
            >
              {product.price.toLocaleString()}
            </span>
          </span>
          {cardTags.length > 0 && (
            <div
              className={`flex flex-wrap gap-1 pointer-events-none select-none ${
                dense ? 'mt-1' : 'mt-1.5'
              }`}
            >
              {cardTags.map(tag => (
                <span
                  key={tag}
                  className={`inline-block rounded-md bg-[#eef3f8] text-[#6b849c] font-medium ${
                    dense ? 'text-[8px] px-1.5 py-px' : 'text-[10px] px-2 py-0.5'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onAddToCart}
          aria-label={`將 ${product.name} 加入購物車`}
          className={`bg-gray-900 text-white rounded-lg shadow-sm active:scale-95 transition-transform flex-shrink-0 self-end ${
            dense ? 'p-1' : 'p-1.5'
          }`}
        >
          <ShoppingCart size={dense ? 10 : 12} />
        </button>
      </div>
    </div>
  </div>
  );
};
