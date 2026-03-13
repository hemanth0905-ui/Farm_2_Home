#!/bin/bash

# Checkout Page
cat > /app/frontend/src/pages/Checkout.js << 'EOF'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/utils/api';

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
EOF

echo "Checkout page created"

# Orders Page
cat > /app/frontend/src/pages/Orders.js << 'EOF'
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/utils/api';
import { Package } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-harvest-green/20 text-harvest-green',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8" data-testid="orders-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16" data-testid="no-orders">
            <Package className="h-24 w-24 text-harvest-mist mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground">Start shopping to see your orders here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} data-testid={`order-${order.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.order_status)} data-testid={`order-status-${order.id}`}>
                      {order.order_status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.product_name} x {item.quantity} {item.unit}</span>
                        <span className="font-medium">₹{item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-harvest-mist mt-4 pt-4 flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-harvest-green" data-testid={`order-total-${order.id}`}>
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Delivery to: {order.delivery_address.city}, {order.delivery_address.state}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
EOF

echo "Orders page created"

# Messages and Profile pages
cat > /app/frontend/src/pages/Messages.js << 'EOF'
import React from 'react';
import { Layout } from '@/components/Layout';

const Messages = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Messages</h1>
        <p className="text-muted-foreground">Message board coming soon...</p>
      </div>
    </Layout>
  );
};

export default Messages;
EOF

cat > /app/frontend/src/pages/Profile.js << 'EOF'
import React from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="text-lg font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="text-lg font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <p className="text-lg font-medium capitalize">{user?.role}</p>
            </div>
            {user?.location && (
              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <p className="text-lg font-medium">{user.location}</p>
              </div>
            )}
            {user?.phone && (
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="text-lg font-medium">{user.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
EOF

echo "Messages and Profile pages created"
