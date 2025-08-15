'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ProviderForm({ provider, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    canGiveReceipt: false,
    hasStamp: false,
    canCredit: false,
    description: '',
    address: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (provider) {
      setFormData(provider);
    }
  }, [provider]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = provider ? `/api/providers/${provider.id}` : '/api/providers';
      const method = provider ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(`Provider ${provider ? 'berhasil diupdate' : 'berhasil ditambahkan'}`);
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nama Penyedia <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          className="input-field"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Masukkan nama penyedia"
        />
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
          placeholder="Deskripsi penyedia (opsional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alamat
        </label>
        <input
          type="text"
          className="input-field"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Alamat penyedia (opsional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nomor Telepon
        </label>
        <input
          type="text"
          className="input-field"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Nomor telepon (opsional)"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="canGiveReceipt"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={formData.canGiveReceipt}
            onChange={(e) => setFormData({ 
              ...formData, 
              canGiveReceipt: e.target.checked,
              hasStamp: e.target.checked ? formData.hasStamp : false
            })}
          />
          <label htmlFor="canGiveReceipt" className="ml-2 block text-sm text-gray-900">
            Bisa memberikan kwitansi kosong
          </label>
        </div>

        {formData.canGiveReceipt && (
          <div className="flex items-center ml-6">
            <input
              id="hasStamp"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.hasStamp}
              onChange={(e) => setFormData({ ...formData, hasStamp: e.target.checked })}
            />
            <label htmlFor="hasStamp" className="ml-2 block text-sm text-gray-900">
              Kwitansi ada cap/stempel
            </label>
          </div>
        )}

        <div className="flex items-center">
          <input
            id="canCredit"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={formData.canCredit}
            onChange={(e) => setFormData({ ...formData, canCredit: e.target.checked })}
          />
          <label htmlFor="canCredit" className="ml-2 block text-sm text-gray-900">
            Bisa dihutangi terlebih dahulu
          </label>
        </div>
      </div>

      <div className="flex space-x-4 pt-6">
        <button
          type="submit"
         disabled={isSubmitting}
         className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1"
       >
         {isSubmitting ? 'Menyimpan...' : (provider ? 'Update Provider' : 'Tambah Provider')}
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