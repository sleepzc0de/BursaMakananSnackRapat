'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function FoodForm({ food, providers, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    providerId: '',
    isAvailable: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Makanan Utama',
    'Snack',
    'Minuman',
    'Paket',
    'Dessert',
    'Lainnya'
  ];

  useEffect(() => {
    if (food) {
      setFormData({
        ...food,
        price: food.price ? food.price.toString() : '',
      });
    }
  }, [food]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = food ? `/api/foods/${food.id}` : '/api/foods';
      const method = food ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
        }),
      });

      if (response.ok) {
        toast.success(`Food ${food ? 'berhasil diupdate' : 'berhasil ditambahkan'}`);
        onSuccess?.();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Makanan/Snack <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Masukkan nama makanan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="input-field"
            value={formData.providerId}
            onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
          >
            <option value="">Pilih Provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="input-field"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Harga (Rp)
          </label>
          <input
            type="number"
            min="0"
            step="500"
            className="input-field"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          className="input-field"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Deskripsi makanan (opsional)"
        />
      </div>

      <div className="flex items-center">
        <input
          id="isAvailable"
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={formData.isAvailable}
          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
        />
        <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
          Tersedia
        </label>
      </div>

      <div className="flex space-x-4 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1"
        >
          {isSubmitting ? 'Menyimpan...' : (food ? 'Update Food' : 'Tambah Food')}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Batal
        </button>
      </div>
    </form>
  );
}