import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/utils/api';
import { Users, Package, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
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
        <h1 className="text-4xl font-bold mb-8" data-testid="admin-dashboard-title">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold" data-testid="total-users">{analytics?.total_users || 0}</p>
                </div>
                <Users className="h-12 w-12 text-harvest-green opacity-20" />
              </div>
            </CardContent>
          </Card>

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
                  <p className="text-3xl font-bold text-harvest-green" data-testid="total-revenue">₹{analytics?.total_revenue?.toFixed(2) || 0}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-harvest-green opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Farmers</p>
                  <p className="text-3xl font-bold" data-testid="total-farmers">{analytics?.total_farmers || 0}</p>
                </div>
                <Users className="h-12 w-12 text-harvest-green opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-harvest-clay/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  <p className="text-3xl font-bold text-harvest-clay" data-testid="pending-approvals">{analytics?.pending_approvals || 0}</p>
                </div>
                <AlertCircle className="h-12 w-12 text-harvest-clay opacity-20" />
              </div>
              <Link to="/admin/farmers">
                <Button variant="outline" size="sm" className="w-full mt-4" data-testid="view-pending-button">
                  View Pending
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
