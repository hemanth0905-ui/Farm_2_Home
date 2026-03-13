import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/utils/api';
import { ArrowRight, Leaf, TrendingDown, Star, ShoppingBag, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Layout>
      <section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(47, 82, 51, 0.7), rgba(47, 82, 51, 0.7)), url('https://images.unsplash.com/photo-1679082310270-4fdaf3c67a7c')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="hero-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              From Farm to Table,<br />Without the Middleman
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Connect directly with local farmers. Fresh produce, fair prices, sustainable living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link to="/products">
                <Button 
                  size="lg" 
                  className="bg-white text-harvest-green hover:bg-white/90 rounded-full px-8 py-6 text-lg font-medium group"
                  data-testid="hero-browse-button"
                >
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-harvest-green rounded-full px-8 py-6 text-lg font-medium"
                  data-testid="hero-register-button"
                >
                  Become a Seller
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-harvest-mist hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-harvest-sand rounded-full flex items-center justify-center mx-auto">
                  <Leaf className="h-8 w-8 text-harvest-green" />
                </div>
                <h3 className="text-xl font-semibold">100% Organic</h3>
                <p className="text-muted-foreground">
                  Fresh, chemical-free produce straight from certified organic farms
                </p>
              </CardContent>
            </Card>

            <Card className="border-harvest-mist hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-harvest-sand rounded-full flex items-center justify-center mx-auto">
                  <TrendingDown className="h-8 w-8 text-harvest-green" />
                </div>
                <h3 className="text-xl font-semibold">Fair Pricing</h3>
                <p className="text-muted-foreground">
                  Direct sourcing means better prices for you and fair wages for farmers
                </p>
              </CardContent>
            </Card>

            <Card className="border-harvest-mist hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-harvest-sand rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-harvest-green" />
                </div>
                <h3 className="text-xl font-semibold">Community Driven</h3>
                <p className="text-muted-foreground">
                  Supporting local farmers and building sustainable food systems
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-24 bg-harvest-sand">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-semibold mb-4">Featured Products</h2>
              <p className="text-lg text-muted-foreground">Fresh arrivals from our trusted farmers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <Link 
                  to={`/products/${product.id}`} 
                  key={product.id}
                  data-testid={`featured-product-${product.id}`}
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
                          <span className="text-xs bg-harvest-green/10 text-harvest-green px-2 py-1 rounded-full font-medium">
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
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-harvest-green">
                          ₹{product.price}
                          <span className="text-sm text-muted-foreground font-normal">/{product.unit}</span>
                        </span>
                        <ShoppingBag className="h-5 w-5 text-harvest-green opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products">
                <Button 
                  size="lg" 
                  className="bg-harvest-green hover:bg-harvest-green/90 rounded-full px-8"
                  data-testid="view-all-products-button"
                >
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section 
        className="relative py-24 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(176, 92, 60, 0.9), rgba(176, 92, 60, 0.9)), url('https://images.unsplash.com/photo-1690067698032-7b966be1d56e')`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Whether you're a farmer looking to sell or a consumer seeking fresh produce, we've got you covered.
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              className="bg-white text-harvest-clay hover:bg-white/90 rounded-full px-8 py-6 text-lg font-medium"
              data-testid="cta-register-button"
            >
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
