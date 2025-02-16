import React from 'react';
import { Sparkles } from 'lucide-react';
import CustomButton from "./button";

const NFTCard = ({ nft, onBuy }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-slate-800/70 to-slate-900/70 p-1">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 p-4 backdrop-blur-sm">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
          <img 
            src={nft.image} 
            alt={nft.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {nft.rarity}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">
            {nft.title}
          </h3>
          
          <p className="text-slate-300 text-sm">
            {nft.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Prezzo</p>
              <p className="text-lg font-bold text-white">
                {nft.price}
              </p>
            </div>
            
            <CustomButton 
              variant="primary" 
              onClick={() => onBuy(nft)}
              className="shadow-lg shadow-violet-600/20"
            >
              Acquista
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;