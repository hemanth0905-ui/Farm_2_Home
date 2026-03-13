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
