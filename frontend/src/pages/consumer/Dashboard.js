import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/utils/api';
import { Package, ShoppingBag } from 'lucide-react';

const ConsumerDashboard = () => {
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

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8" data-testid="consumer-dashboard-title">My Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold" data-testid="total-orders">{orders.length}</p>
                </div>
                <Package className="h-12 w-12 text-harvest-green opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-3xl font-bold text-harvest-green" data-testid="total-spent">₹{totalSpent.toFixed(2)}</p>
                </div>
                <ShoppingBag className="h-12 w-12 text-harvest-green opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col justify-center">
              <Link to="/products">
                <Button className="w-full bg-harvest-green hover:bg-harvest-green/90 rounded-full" data-testid="browse-products-button">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
            {orders.slice(0, 5).length === 0 ? (
              <p className="text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between items-center border-b border-harvest-mist pb-4">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-harvest-green">₹{order.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{order.order_status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/orders">
              <Button variant="outline" className="w-full mt-4">View All Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ConsumerDashboard;
