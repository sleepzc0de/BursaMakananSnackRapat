'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import FoodForm from '../../../components/FoodForm';
import SearchBar from '../../../components/SearchBar';
import toast from 'react-hot-toast';

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState([]);
  const [providers, setProviders] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    Promise.all([fetchFoods(), fetchProviders()]);
  }, []);

  useEffect(() => {
    filterFoods();
  }, [foods, searchTerm, categoryFilter, providerFilter]);

  const fetchFoods = async () => {
    try {
      const response = await fetch('/api/foods');
      if (response.ok) {
        const data = await response.json();
        setFoods(data);
      } else {
        toast.error('Gagal memuat data makanan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const filterFoods = () => {
    let filtered = foods;

    if (searchTerm) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(food => food.category === categoryFilter);
    }

    if (providerFilter) {
      filtered = filtered.filter(food => food.providerId === providerFilter);
    }

    setFilteredFoods(filtered);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/foods/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Makanan berhasil dihapus');
        fetchFoods();
      } else {
        toast.error('Gagal menghapus makanan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
    setShowDeleteConfirm(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingFood(null);
    fetchFoods();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFood(null);
  };

  const categories = [...new Set(foods.map(food => food.category))];

  const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Makanan & Menu</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Tambah Makanan</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar 
              onSearch={setSearchTerm}
              placeholder="Cari makanan..."
            />
          </div>
          <div>
            <select
              className="input-field"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="input-field"
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
            >
              <option value="">Semua Provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {(searchTerm || categoryFilter || providerFilter) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setProviderFilter('');
              }}
              className="btn-secondary text-red-600 hover:text-red-800"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingFood ? 'Edit Makanan' : 'Tambah Makanan Baru'}
          </h2>
          <FoodForm
            food={editingFood}
            providers={providers}
            onSuccess={handleFormSuccess}
           onCancel={handleFormCancel}
         />
       </div>
     )}

     <div className="card overflow-hidden">
       <div className="px-6 py-4 border-b border-gray-200">
         <h2 className="text-lg font-medium">
           Daftar Makanan ({filteredFoods.length})
         </h2>
       </div>
       
       {filteredFoods.length === 0 ? (
         <div className="text-center py-8 text-gray-500">
           <p>Belum ada makanan yang tersedia</p>
         </div>
       ) : (
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Makanan
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Provider
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Kategori
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Harga
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Status
                 </th>
                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Actions
                 </th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {filteredFoods.map((food) => (
                 <tr key={food.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4">
                     <div>
                       <div className="text-sm font-medium text-gray-900">
                         {food.name}
                       </div>
                       {food.description && (
                         <div className="text-sm text-gray-500 mt-1">
                           {food.description.length > 60 
                             ? `${food.description.substring(0, 60)}...`
                             : food.description
                           }
                         </div>
                       )}
                     </div>
                   </td>
                   <td className="px-6 py-4 text-sm text-gray-900">
                     {food.provider?.name || '-'}
                   </td>
                   <td className="px-6 py-4">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                       {food.category}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-sm text-gray-900">
                     {formatPrice(food.price)}
                   </td>
                   <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                       food.isAvailable
                         ? 'bg-green-100 text-green-800'
                         : 'bg-red-100 text-red-800'
                     }`}>
                       {food.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right text-sm font-medium">
                     <div className="flex justify-end space-x-2">
                       <button
                         onClick={() => {
                           setEditingFood(food);
                           setShowForm(true);
                         }}
                         className="text-primary-600 hover:text-primary-900"
                       >
                         <Edit size={16} />
                       </button>
                       <button
                         onClick={() => setShowDeleteConfirm(food.id)}
                         className="text-red-600 hover:text-red-900"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       )}
     </div>

     {/* Delete Confirmation Modal */}
     {showDeleteConfirm && (
       <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
         <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
           <div className="mt-3 text-center">
             <h3 className="text-lg font-medium text-gray-900">
               Konfirmasi Hapus
             </h3>
             <div className="mt-2 px-7 py-3">
               <p className="text-sm text-gray-500">
                 Apakah Anda yakin ingin menghapus makanan ini? 
                 Tindakan ini tidak dapat dibatalkan.
               </p>
             </div>
             <div className="items-center px-4 py-3">
               <div className="flex space-x-4">
                 <button
                   onClick={() => handleDelete(showDeleteConfirm)}
                   className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                 >
                   Hapus
                 </button>
                 <button
                   onClick={() => setShowDeleteConfirm(null)}
                   className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                 >
                   Batal
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}