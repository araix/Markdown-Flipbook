import React from 'react';
import { X, ShoppingCart, Star } from 'lucide-react';
import { PurchaseInfo } from '../types/book';

interface PurchaseModalProps {
  purchaseInfo: PurchaseInfo;
  bookTitle: string;
  onClose: () => void;
  isVisible: boolean;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  purchaseInfo,
  bookTitle,
  onClose,
  isVisible
}) => {
  if (!isVisible) return null;

  const handlePurchase = () => {
    window.open(purchaseInfo.link, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="text-center">
            <div className="mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart size={32} className="text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Love This Book?</h2>
            <p className="text-amber-100 text-sm">Buy print book now!</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {bookTitle}
            </h3>
            
            {/* Rating stars */}
            <div className="flex justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm text-gray-600 ml-2">(4.8/5)</span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-sm leading-relaxed">
              {purchaseInfo.text}
            </p>
          </div>

          {/* Purchase button */}
          <div className="space-y-3">
            <button
              onClick={handlePurchase}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCart size={20} />
                <span>
                  Get Complete Book
                  {purchaseInfo.price && (
                    <span className="ml-2 font-bold">{purchaseInfo.price}</span>
                  )}
                </span>
              </div>
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
            >
              Continue reading preview
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center">
          <p className="text-xs text-gray-500">
            Secure delivery • Secure checkout
          </p>
        </div>
      </div>
    </div>
  );
};