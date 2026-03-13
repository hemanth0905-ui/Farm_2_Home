import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Star, Leaf, Package, TrendingDown, MessageSquare, ShoppingCart } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchProduct = useCallback(async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const addToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.images?.[0],
        quantity: quantity,
        stock: product.stock
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart!');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        product_id: product.id,
        rating,
        comment
      });
      toast.success('Review submitted!');
      setComment('');
      setRating(5);
      fetchProduct();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    }
  };

  const calculateDiscount = () => {
    if (!product.bulk_discounts || Object.keys(product.bulk_discounts).length === 0) {
      return 0;
    }
    
    let discount = 0;
    for (const [qty, disc] of Object.entries(product.bulk_discounts)) {
      if (quantity >= parseFloat(qty)) {
        discount = Math.max(discount, disc);
      }
    }
    return discount;
  };

  const getFinalPrice = () => {
    const discount = calculateDiscount();
    return product.price * (1 - discount / 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvest-green"></div>
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden" data-testid="product-image">
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1613061527119-56ad37b8a581'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.is_organic && (
                  <span className="text-sm bg-harvest-green/10 text-harvest-green px-3 py-1 rounded-full font-medium flex items-center gap-1" data-testid="organic-badge">
                    <Leaf className="h-4 w-4" />
                    Organic
                  </span>
                )}
                <span className="text-sm bg-harvest-sand px-3 py-1 rounded-full font-medium" data-testid="category-badge">
                  {product.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2" data-testid="product-name">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                {product.rating > 0 && (
                  <div className="flex items-center gap-1" data-testid="product-rating">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{product.rating}</span>
                    <span className="text-muted-foreground">({product.review_count} reviews)</span>
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground" data-testid="product-description">{product.description}</p>
            </div>

            <Card className="bg-harvest-sand border-0">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-harvest-green" data-testid="product-price">
                    ₹{getFinalPrice().toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground">/{product.unit}</span>
                  {calculateDiscount() > 0 && (
                    <span className="text-sm text-harvest-clay font-medium">
                      {calculateDiscount()}% off
                    </span>
                  )}
                </div>

                {product.market_avg_price && product.market_avg_price > product.price && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-harvest-green" />
                    <span className="text-muted-foreground">
                      Save ₹{(product.market_avg_price - product.price).toFixed(2)} vs market price
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground" data-testid="product-stock">
                    {product.stock > 0 ? `${product.stock} ${product.unit} available` : 'Out of stock'}
                  </span>
                </div>

                {Object.keys(product.bulk_discounts || {}).length > 0 && (
                  <div className="border-t border-harvest-mist pt-4">
                    <p className="font-medium mb-2">Bulk Discounts:</p>
                    {Object.entries(product.bulk_discounts).map(([qty, discount]) => (
                      <p key={qty} className="text-sm text-muted-foreground">
                        Buy {qty}+ {product.unit}: {discount}% off
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {user?.role === 'consumer' && product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24"
                    data-testid="quantity-input"
                  />
                  <Button
                    onClick={addToCart}
                    className="flex-1 bg-harvest-green hover:bg-harvest-green/90 rounded-full py-6 text-lg"
                    data-testid="add-to-cart-button"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            )}

            {product.farmer && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Sold by</h3>
                  <p className="text-lg">{product.farmer.name}</p>
                  <p className="text-sm text-muted-foreground">{product.farmer.location}</p>
                  {user?.role === 'consumer' && (
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={() => navigate('/messages', { state: { receiverId: product.farmer.id } })}
                      data-testid="contact-farmer-button"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Farmer
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4" data-testid="reviews-list">
                {product.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.user_name}</span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            )}
          </div>

          {user?.role === 'consumer' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                            data-testid={`star-${star}`}
                          >
                            <Star
                              className={`h-8 w-8 cursor-pointer ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Comment</label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        required
                        data-testid="review-comment-input"
                        className="bg-white border-harvest-mist"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-harvest-green hover:bg-harvest-green/90"
                      data-testid="submit-review-button"
                    >
                      Submit Review
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
