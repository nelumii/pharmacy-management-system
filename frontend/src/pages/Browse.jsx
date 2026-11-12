import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

export default function Browse(){
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [visibleItems, setVisibleItems] = useState(8);
  const observerRef = useRef(null);
  const { addItem } = useCart();

  useEffect(()=>{ load(); },[]);
  const load = async ()=>{
    try {
      setLoading(true);
      const {data} = await api.get('/api/medicines', { params:{ availableOnly: true } });
      setList(data);
    } catch (error) {
      console.error('Failed to load medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = list
    .filter(m =>
      (!q || m.name.toLowerCase().includes(q.toLowerCase())) &&
      (!cat || (m.category||'').toLowerCase().includes(cat.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'quantity':
          return b.quantity - a.quantity;
        case 'expiry':
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const displayedItems = filtered.slice(0, visibleItems);
  const hasMoreItems = filtered.length > visibleItems;

  const handleAddToCart = (medicine) => {
    addItem(medicine);
    toast.success(`✅ ${medicine.name} added to cart!`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const loadMore = () => {
    setVisibleItems(prev => prev + 8);
  };

  // Infinite scroll setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreItems) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMoreItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 animate-spin animation-delay-75"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading medicines...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
              <span className="text-white text-2xl">💊</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Browse Medicines</h1>
              <p className="text-gray-600 mt-2">Find and purchase quality medicines</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transform hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4 lg:mb-0">
              <span className="text-blue-500 mr-2">🔍</span>
              Search & Filter
            </h2>
            <div className="flex items-center space-x-4">
              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="quantity">Stock Level</option>
                  <option value="expiry">Expiry Date</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ⊞ Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ☰ List
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
              <div className="relative">
                     <input
                         className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                         placeholder="e.g., Paracetamol, Amoxicillin..."
                         value={q}
                         onChange={e=>setQ(e.target.value)}
                       />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="relative">
                     <input
                         className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                         placeholder="e.g., Painkiller, Antibiotic..."
                         value={cat}
                         onChange={e=>setCat(e.target.value)}
                       />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🏷️</span>
                </div>
              </div>
            </div>
            <div className="flex items-end">
                   <div className="w-full bg-gradient-to-r from-green-50 to-green-50 rounded-lg p-4 border border-green-200">
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm font-medium text-gray-700">Results</p>
                           <p className="text-2xl font-bold text-green-600">{filtered.length}</p>
                         </div>
                         <span className="text-2xl">📊</span>
                       </div>
                     </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {filtered.length > 0 && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-green-600">{displayedItems.length}</span> of{' '}
              <span className="font-semibold">{filtered.length}</span> medicines
              {q && <span> matching "<span className="font-medium">{q}</span>"</span>}
              {cat && <span> in category "<span className="font-medium">{cat}</span>"</span>}
            </p>
          </div>
        )}

        {/* Medicine Grid/List */}
        {displayedItems.length > 0 ? (
          <div className={`${viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }`}>
            {displayedItems.map((m, index) => (
              <div
                key={m.id}
                className={`bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in ${
                  viewMode === 'list' ? 'flex items-center space-x-6 p-6' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Medicine Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-lg">💊</span>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      m.quantity === 0
                        ? 'bg-red-100 text-red-800'
                        : m.quantity < 10
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {m.quantity === 0 ? 'Out of Stock' : m.quantity < 10 ? `Low: ${m.quantity}` : `In Stock`}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{m.name}</h3>

                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {m.category || 'General'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600">
                      ${Number(m.price).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      per unit
                    </div>
                  </div>
                </div>

                {/* Expiry Info */}
                <div className="px-6 py-3 bg-gray-50">
                  <div className="flex items-center text-sm">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      new Date(m.expiryDate) < new Date()
                        ? 'bg-red-100 text-red-800'
                        : new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {new Date(m.expiryDate) < new Date() ? '⏰ Expired' : `Expires: ${new Date(m.expiryDate).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="p-6 pt-4">
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      m.quantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                    onClick={() => m.quantity > 0 && handleAddToCart(m)}
                    disabled={m.quantity === 0}
                  >
                    {m.quantity === 0 ? '🚫 Out of Stock' : '🛒 Add to Cart'}
                  </button>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMoreItems && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Load More Medicines ({filtered.length - displayedItems.length} remaining)
                </button>
              </div>
            )}

            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="h-10"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
              <span className="text-white text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No medicines found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or browse all available medicines.</p>
            <button
              onClick={() => {setQ(''); setCat('');}}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
