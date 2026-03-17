import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Store, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function EventVendors() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getEventBySlug, managedVendors } = useApp();
  const event = getEventBySlug(slug ?? '');
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-on-surface-variant">행사를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const categories = event.vendorCategories ?? [];
  const vendors = event.vendors ?? [];

  return (
    <div className="min-h-screen bg-surface pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-surface-container-lowest border-b border-outline-variant/15 shadow-none">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(`/e/${slug}`)}
            className="p-1.5 rounded-lg hover:bg-surface-container"
          >
            <ChevronLeft size={22} className="text-on-surface-variant" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-on-surface text-sm truncate">{event.title}</p>
            <p className="text-xs text-outline">입점 업체</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-outline">
            <Store size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">등록된 업체가 없습니다.</p>
          </div>
        ) : (
          categories.map(cat => {
            const catVendors = vendors.filter(v => v.categoryId === cat.id);
            if (catVendors.length === 0) return null;
            return (
              <div key={cat.id}>
                <h2 className="font-headline font-bold text-on-surface text-base mb-3 px-1">{cat.name}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {catVendors.map(vendor => {
                    const img = vendor.imageUrl
                      || (vendor.managedVendorId ? managedVendors.find(m => m.id === vendor.managedVendorId)?.imageUrl : undefined);
                    return (
                    <div key={vendor.id} className="bg-surface-container-lowest rounded-xl overflow-hidden">
                      {img ? (
                        <div
                          className="w-full h-40 bg-surface-container overflow-hidden cursor-pointer"
                          onClick={() => setLightbox(img)}
                        >
                          <img
                            src={img}
                            alt={vendor.name}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-40 bg-surface-container flex items-center justify-center">
                          <Store size={32} className="text-outline" />
                        </div>
                      )}
                      <div className="px-3 py-2.5">
                        <p className="font-semibold text-sm text-on-surface truncate">{vendor.name}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white"
            onClick={() => setLightbox(null)}
          >
            <X size={22} />
          </button>
          <img
            src={lightbox}
            alt="업체 이미지"
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
