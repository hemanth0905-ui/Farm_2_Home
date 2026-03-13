import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(i => i.product_id === productId);
    if (newQuantity > item.stock) {
      toast.error(`Only ${item.stock} ${item.unit} available`);
      return;
    }
    
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.product_id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.05;
  };

  const getDeliveryCharge = () => {
    return getSubtotal() < 500 ? 50 : 0;
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getDeliveryCharge();
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-12" data-testid="empty-cart">
          <ShoppingBag className="h-24 w-24 text-harvest-mist mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some fresh products to get started</p>
          <Link to="/products">
            <Button className="bg-harvest-green hover:bg-harvest-green/90 rounded-full">
              Browse Products
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8" data-testid="cart-title">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.product_id} data-testid={`cart-item-${item.product_id}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1613061527119-56ad37b8a581'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <Link to={`/products/${item.product_id}`}>
                        <h3 className="font-semibold text-lg hover:text-harvest-green">{item.name}</h3>
                      </Link>
                      <p className="text-muted-foreground">₹{item.price} / {item.unit}</p>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            data-testid={`decrease-quantity-${item.product_id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                            className="w-20 text-center"
                            data-testid={`quantity-input-${item.product_id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            data-testid={`increase-quantity-${item.product_id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.product_id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          data-testid={`remove-item-${item.product_id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-harvest-green" data-testid={`item-total-${item.product_id}`}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Order Summary</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span data-testid="subtotal">₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5%)</span>
                    <span data-testid="tax">₹{getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span data-testid="delivery">{getDeliveryCharge() === 0 ? 'FREE' : `₹${getDeliveryCharge()}`}</span>
                  </div>
                  {getSubtotal() < 500 && (
                    <p className="text-xs text-harvest-clay">
                      Add ₹{(500 - getSubtotal()).toFixed(2)} more for free delivery
                    </p>
                  )}
                  <div className="border-t border-harvest-mist pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-harvest-green" data-testid="total">₹{getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-harvest-green hover:bg-harvest-green/90 rounded-full py-6 text-lg"
                  onClick={proceedToCheckout}
                  data-testid="checkout-button"
                >
                  Proceed to Checkout
                </Button>

                <Link to="/products">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
