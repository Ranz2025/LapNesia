import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Link } from "react-router-dom";

const ProductCard = ({
  id, slug, brand, model, title, cpu, ram, storage, specs,
  price, image, badge, badgeColor, oldPrice, avgRating, ratingCount,
  is_sold, status,
}) => {
  const isSold = is_sold || status === "sold";
  const displayModel = String(model || title || '').trim();
  const displayBrand = String(brand || '').trim();
  const displaySpecs = specs
    ? String(specs).trim()
    : [cpu, ram && `${ram}GB`, storage && `${storage}GB SSD`].filter(Boolean).join(' • ');

  const card = (
    <div className={`bg-white rounded-xl border overflow-hidden transition ${isSold ? "border-gray-100 opacity-75 cursor-not-allowed" : "border-gray-100 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"}`}>
      {/* Image */}
      <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
        {/* Overlay Habis */}
        {isSold && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-red-500/90 text-white">
              Habis
            </span>
          </div>
        )}
        {!isSold && badge && (
          <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 ${badgeColor || 'bg-green-500'}`}>
            {badge}
          </span>
        )}
        {!isSold && (
          <button
            className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-400 transition z-10"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={14} />
          </button>
        )}
        {image ? (
          <img
            src={image}
            alt={`${displayBrand} ${displayModel}`}
            className={`w-full h-full object-cover transition duration-300 ${!isSold ? "group-hover:scale-105" : ""}`}
          />
        ) : (
          <ShoppingBag className="text-gray-300" size={36} />
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className={`font-semibold text-sm line-clamp-1 ${isSold ? "text-gray-400" : "text-gray-900"}`}>
          {displayBrand} {displayModel}
        </h3>
        {displaySpecs && (
          <p className="text-[11px] text-gray-400 mt-0.5 mb-2 line-clamp-1">{displaySpecs}</p>
        )}
        {isSold ? (
          <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100 mb-1">
            Terjual
          </span>
        ) : (
          <>
            {oldPrice && <p className="text-xs text-gray-400 line-through mb-0.5">{oldPrice}</p>}
            <p className="text-sm font-bold text-blue-600">
              {typeof price === 'string' ? price : `Rp ${Number(price).toLocaleString("id-ID")}`}
            </p>
          </>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-0.5">
            <Star size={11} className={isSold ? "fill-gray-300 text-gray-300" : "fill-yellow-400 text-yellow-400"} />
            <span className="text-[11px] text-gray-500">
              {avgRating > 0 ? avgRating : "–"}
            </span>
            {ratingCount > 0 && (
              <span className="text-[11px] text-gray-400 ml-0.5">({ratingCount})</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isSold) return <div className="group">{card}</div>;

  return (
    <Link to={`/laptop/${slug || id}`} className="group">
      {card}
    </Link>
  );
};

export default ProductCard;
