import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/utils/api';
import { Search, Star, Leaf, ShoppingBag, SlidersHorizontal } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isOrganic, setIsOrganic] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category && category !== 'all') params.category = category;
      if (isOrganic) params.is_organic = true;
      if (search) params.search = search;

      const response = await api.get('/products', { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [category, isOrganic, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    fetchProducts();
  };

  return (
    <Layout>
      <div className="bg-harvest-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Fresh Produce Marketplace</h1>
          <p className="text-lg text-white/90">Discover quality products from local farmers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="search-input"
                className="bg-white border-harvest-mist"
              />
              <Button 
                onClick={handleSearch} 
                className="bg-harvest-green hover:bg-harvest-green/90"
                data-testid="search-button"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
              data-testid="toggle-filters-button"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className={`flex flex-col md:flex-row gap-4 ${showFilters ? 'block' : 'hidden md:flex'}`}>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48 bg-white" data-testid="category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Vegetables">Vegetables</SelectItem>
                <SelectItem value="Fruits">Fruits</SelectItem>
                <SelectItem value="Dairy">Dairy</SelectItem>
                <SelectItem value="Grains">Grains</SelectItem>
                <SelectItem value="Herbs">Herbs</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-harvest-mist">
              <Checkbox 
                id="organic" 
                checked={isOrganic} 
                onCheckedChange={setIsOrganic}
                data-testid="organic-filter"
              />
              <label htmlFor="organic" className="text-sm font-medium cursor-pointer">
                Organic Only
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="aspect-square bg-harvest-mist rounded-lg mb-4"></div>
                <div className="h-4 bg-harvest-mist rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-harvest-mist rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16" data-testid="no-products-message">
            <p className="text-lg text-muted-foreground">No products found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" data-testid="products-grid">
            {products.map((product) => (
              <Link 
                to={`/products/${product.id}`} 
                key={product.id}
                data-testid={`product-card-${product.id}`}
              >
                <Card className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 border border-transparent hover:border-harvest-mist h-full">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1613061527119-56ad37b8a581'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {product.is_organic && (
                        <span className="text-xs bg-harvest-green/10 text-harvest-green px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <Leaf className="h-3 w-3" />
                          Organic
                        </span>
                      )}
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-medium">{product.rating}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-harvest-green">
                          ₹{product.price}
                        </span>
                        <span className="text-sm text-muted-foreground">/{product.unit}</span>
                      </div>
                      <ShoppingBag className="h-5 w-5 text-harvest-green opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {product.stock < 10 && product.stock > 0 && (
                      <p className="text-xs text-harvest-clay mt-2">Only {product.stock} left!</p>
                    )}
                    {product.stock === 0 && (
                      <p className="text-xs text-red-500 mt-2">Out of stock</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;