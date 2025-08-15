'use client';
import { Star, Receipt, Stamp, CreditCard, MapPin, Phone, UtensilsCrossed, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import RatingComponent from './RatingComponent';

export default function ProviderCard({ provider, userRating, currentUser, onRatingUpdate }) {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showFoods, setShowFoods] = useState(false);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const groupedFoods = provider.foods?.reduce((acc, food) => {
    if (!acc[food.category]) {
      acc[food.category] = [];
    }
    acc[food.category].push(food);
    return acc;
  }, {});

  return (
    <div className="card p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
            <div className="flex items-center mt-1 space-x-2">
              <div className="flex">{renderStars(provider.averageRating)}</div>
              <span className="text-sm text-gray-600">
                {provider.averageRating} ({provider.totalRatings} rating)
              </span>
            </div>
          </div>
        </div>

        {provider.description && (
          <p className="text-gray-600">{provider.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            provider.canGiveReceipt 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <Receipt size={16} />
            <span>{provider.canGiveReceipt ? 'Bisa Kwitansi' : 'Tidak Ada Kwitansi'}</span>
          </div>
          
          {provider.canGiveReceipt && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              provider.hasStamp 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <Stamp size={16} />
              <span>{provider.hasStamp ? 'Ada Cap' : 'Tanpa Cap'}</span>
            </div>
          )}
          
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            provider.canCredit 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <CreditCard size={16} />
            <span>{provider.canCredit ? 'Bisa Hutang' : 'Tidak Bisa Hutang'}</span>
          </div>
        </div>

        {(provider.address || provider.phone) && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {provider.address && (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin size={16} />
                <span className="text-sm">{provider.address}</span>
              </div>
            )}
            {provider.phone && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone size={16} />
                <span className="text-sm">{provider.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Foods/Menu Section */}
        {provider.foods && provider.foods.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={() => setShowFoods(!showFoods)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <div className="flex items-center space-x-2">
                <UtensilsCrossed size={16} />
                <span>Menu Tersedia ({provider.foods.length})</span>
              </div>
              {showFoods ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showFoods && (
              <div className="mt-3 space-y-3">
                {Object.entries(groupedFoods || {}).map(([category, foods]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {foods.map((food) => (
                        <div key={food.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h5 className="text-sm font-medium text-gray-900">{food.name}</h5>
                                {!food.isAvailable && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Habis
                                  </span>
                                )}
                              </div>
                              {food.description && (
                                <p className="text-xs text-gray-600 mt-1">{food.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-primary-600">
                                {formatPrice(food.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentUser && currentUser.role === 'USER' && (
          <div className="pt-4 border-t border-gray-200">
            {userRating ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium">Rating Anda:</span>
                  <div className="flex">{renderStars(userRating.rating)}</div>
                </div>
                {userRating.comment && (
                  <p className="text-sm text-gray-600">{userRating.comment}</p>
                )}
                <button
                  onClick={() => setShowRatingForm(!showRatingForm)}
                  className="text-sm text-primary-600 hover:text-primary-800 mt-2"
                >
                  {showRatingForm ? 'Batal Edit' : 'Edit Rating'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRatingForm(!showRatingForm)}
                className="btn-primary w-full"
              >
                {showRatingForm ? 'Batal' : 'Berikan Rating'}
              </button>
            )}
            
            {showRatingForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <RatingComponent
                  providerId={provider.id}
                  userRating={userRating}
                  onRatingUpdate={() => {
                    setShowRatingForm(false);
                    onRatingUpdate?.();
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}