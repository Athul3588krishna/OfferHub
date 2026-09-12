import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Shop, Offer } from '../../types';
import { MapPin, Navigation, Phone, Star, ArrowUpRight } from 'lucide-react';

interface PerinthalmannaMapProps {
  shops: Shop[];
  offers: Offer[];
  onSelectOffer: (offer: Offer) => void;
  onSelectShop: (shopId: string) => void;
}

export const PerinthalmannaMap: React.FC<PerinthalmannaMapProps> = ({
  shops,
  offers,
  onSelectOffer,
  onSelectShop
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  // Perinthalmanna Center
  const PMNA_COORDS: [number, number] = [10.9760, 76.2254];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: PMNA_COORDS,
        zoom: 15,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Custom modern pin SVG
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background: #059669;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          <div style="transform: rotate(45deg); font-size: 14px; font-weight: bold;">📍</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // Add pins for shops
    shops.forEach(shop => {
      const marker = L.marker([shop.latitude, shop.longitude], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedShop(shop);
        map.setView([shop.latitude, shop.longitude], 16, { animate: true });
      });

      marker.bindTooltip(`<b>${shop.shop_name}</b><br/>${shop.category.toUpperCase()}`, {
        direction: 'top',
        offset: [0, -30],
      });

      markersRef.current.push(marker);
    });

    return () => {
      // Cleanup on unmount
    };
  }, [shops]);

  const activeShopOffers = selectedShop 
    ? offers.filter(o => o.shop_id === selectedShop.id && o.status === 'approved')
    : [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col lg:flex-row">
      {/* Map Left View */}
      <div className="flex-1 relative min-h-[400px] lg:min-h-[520px]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Controls Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Perinthalmanna Live Commercial Map</span>
        </div>
      </div>

      {/* Selected Shop & Offer Drawer */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 flex flex-col justify-between bg-slate-50/70">
        {selectedShop ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {selectedShop.category}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{selectedShop.rating}</span>
                  <span className="text-slate-400 font-normal">({selectedShop.total_reviews})</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-2">
                {selectedShop.shop_name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{selectedShop.address}</span>
              </p>
            </div>

            {/* Contact & Directions */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`tel:${selectedShop.phone}`}
                className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Shop</span>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedShop.latitude},${selectedShop.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Directions</span>
              </a>
            </div>

            {/* Active Offers from this Shop */}
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Active Shop Deals ({activeShopOffers.length})
              </p>
              {activeShopOffers.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeShopOffers.map(offer => (
                    <div
                      key={offer.id}
                      onClick={() => onSelectOffer(offer)}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 cursor-pointer transition-all flex items-center gap-3 group"
                    >
                      <img
                        src={offer.image_url}
                        alt={offer.product_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                          {offer.product_name}
                        </p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-emerald-600">
                            ₹{offer.offer_price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{offer.original_price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-bold text-rose-600">
                            {offer.discount_percentage}% OFF
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No active deals published right now.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Select a Shop on the Map</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Click any merchant pin in Perinthalmanna (Ooty Rd, Jubilee Jn, Pattambi Rd, Bypass) to preview discounts and live offers.
            </p>
          </div>
        )}

        {/* Perinthalmanna Town Center Quick Jump */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView(PMNA_COORDS, 15, { animate: true });
              setSelectedShop(null);
            }
          }}
          className="mt-4 w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
        >
          Reset to Town Center
        </button>
      </div>
    </div>
  );
};
