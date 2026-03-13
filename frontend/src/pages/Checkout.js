import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import api from '../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
    setCart(savedCart);
  }, [navigate]);

  const getTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const delivery = subtotal < 500 ? 50 : 0;
    return subtotal + tax + delivery;
  };

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
      toast.error('Please fill all address fields');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const orderResponse = await api.post('/orders', {
        items,
        delivery_address: address
      });

      const paymentResponse = await api.post('/payments/create-order', {
        order_id: orderResponse.data.id,
        amount: orderResponse.data.total
      });

      const options = {
        key: paymentResponse.data.key_id,
        amount: paymentResponse.data.amount,
        currency: paymentResponse.data.currency,
        order_id: paymentResponse.data.razorpay_order_id,
        name: 'The Modern Harvest',
        description: 'Fresh Produce Purchase',
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            localStorage.removeItem('cart');
            toast.success('Order placed successfully!');
            navigate('/orders');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: address.phone
        },
        theme: {
          color: '#2F5233'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8" data-testid="checkout-title">Checkout</h1>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                    data-testid="address-street"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    data-testid="address-city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                    data-testid="address-state"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={address.pincode}
                    onChange={(e) => setAddress({...address, pincode: e.target.value})}
                    data-testid="address-pincode"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={address.phone}
                    onChange={(e) => setAddress({...address, phone: e.target.value})}
                    data-testid="address-phone"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Total</h2>
              <div className="text-3xl font-bold text-harvest-green" data-testid="checkout-total">
                ₹{getTotal().toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {cart.length} item(s)
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-harvest-green hover:bg-harvest-green/90 rounded-full py-6 text-lg"
            data-testid="place-order-button"
          >
            {loading ? 'Processing...' : 'Place Order & Pay'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
