'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import ProviderCard from '../components/ProviderCard';
import SearchBar from '../components/SearchBar';
import { Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    canGiveReceipt: false,
    hasStamp: false,
    canCredit: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    // Check authentication
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Decode token to get user info
    try {
      const payload = JSON.parse(atob(token.split('=')[1].split('.')[1]));
      setCurrentUser(payload);
    } catch (e) {
      router.push('/login');
      return;
    }

    fetchProviders();
  }, [router]);

  useEffect(() => {
    if (isMounted) {
      filterProviders();
    }
  }, [providers, searchTerm, filters, isMounted]);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      } else {
        toast.error('Gagal memuat data provider');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (provider.description && provider.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Feature filters
    if (filters.canGiveReceipt) {
      filtered = filtered.filter(provider => provider.canGiveReceipt);
    }
    if (filters.hasStamp) {
      filtered = filtered.filter(provider => provider.hasStamp);
    }
    if (filters.canCredit) {
      filtered = filtered.filter(provider => provider.canCredit);
    }

    setFilteredProviders(filtered);
  };

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const clearFilters = () => {
    setFilters({
      canGiveReceipt: false,
      hasStamp: false,
      canCredit: false,
    });
    setSearchTerm('');
  };

  if (!isMounted) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole={currentUser?.role}>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daftar Penyedia Makanan & Snack
          </h1>
          <p className="text-gray-600">
            Temukan penyedia makanan dan snack yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar 
                onSearch={setSearchTerm}
                placeholder="Cari nama penyedia atau deskripsi..."
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Filter size={20} />
                <span>Filter</span>
              </button>
              {(Object.values(filters).some(Boolean) || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary text-red-600 hover:text-red-800"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter berdasarkan:</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.canGiveReceipt}
                    onChange={() => handleFilterChange('canGiveReceipt')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Bisa Kwitansi</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasStamp}
                    onChange={() => handleFilterChange('hasStamp')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Ada Cap</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.canCredit}
                    onChange={() => handleFilterChange('canCredit')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm">Bisa Hutang</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredProviders.length} Provider Ditemukan
          </h2>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">Tidak ada provider yang ditemukan</p>
              <p>Coba ubah kriteria pencarian atau filter Anda</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                userRating={provider.ratings?.[0]}
                currentUser={currentUser}
                onRatingUpdate={fetchProviders}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}