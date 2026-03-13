import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/utils/api';
import { Package, TrendingUp, ShoppingBag, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FarmerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/farmer/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold" data-testid="farmer-dashboard-title">Farmer Dashboard</h1>
          <Link to="/farmer/products">
            <Button className="bg-harvest-green hover:bg-harvest-green/90 rounded-full" data-testid="manage-products-button">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-3xl font-bold" data-testid="total-products">{analytics?.total_products || 0}</p>
                </div>
                <Package className="h-12 w-12 text-harvest-green opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold" data-testid="total-orders">{analytics?.total_orders || 0}</p>
                </div>
                <ShoppingBag className="h-12 w-12 text-harvest-green opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-harvest-green" data-testid="total-revenue">
                    ₹{analytics?.total_revenue?.toFixed(2) || 0}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-harvest-green opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {analytics?.top_products && analytics.top_products.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Top Selling Products</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.top_products}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#2F5233" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default FarmerDashboard;
