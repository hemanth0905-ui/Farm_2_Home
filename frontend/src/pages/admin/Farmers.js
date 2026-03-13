import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/utils/api';
import { CheckCircle, XCircle } from 'lucide-react';

const AdminFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await api.get('/admin/farmers');
      setFarmers(response.data);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveFarmer = async (id) => {
    try {
      await api.post(`/admin/approve-farmer/${id}`);
      toast.success('Farmer approved!');
      fetchFarmers();
    } catch (error) {
      toast.error('Failed to approve farmer');
    }
  };

  const blockUser = async (id) => {
    if (!window.confirm('Are you sure you want to block this user?')) return;
    try {
      await api.post(`/admin/block-user/${id}`);
      toast.success('User blocked!');
      fetchFarmers();
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const unblockUser = async (id) => {
    try {
      await api.post(`/admin/unblock-user/${id}`);
      toast.success('User unblocked!');
      fetchFarmers();
    } catch (error) {
      toast.error('Failed to unblock user');
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
        <h1 className="text-4xl font-bold mb-8" data-testid="admin-farmers-title">Manage Farmers</h1>

        <div className="space-y-4">
          {farmers.map((farmer) => (
            <Card key={farmer.id} data-testid={`farmer-${farmer.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{farmer.name}</h3>
                    <p className="text-sm text-muted-foreground">{farmer.email}</p>
                    <p className="text-sm text-muted-foreground">{farmer.location}</p>
                    <p className="text-sm text-muted-foreground">{farmer.phone}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {farmer.is_approved ? (
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    )}
                    {farmer.is_blocked && (
                      <Badge className="bg-red-100 text-red-800">Blocked</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {!farmer.is_approved && (
                    <Button
                      size="sm"
                      className="bg-harvest-green hover:bg-harvest-green/90"
                      onClick={() => approveFarmer(farmer.id)}
                      data-testid={`approve-farmer-${farmer.id}`}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  {!farmer.is_blocked ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => blockUser(farmer.id)}
                      data-testid={`block-farmer-${farmer.id}`}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Block
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => unblockUser(farmer.id)}
                      data-testid={`unblock-farmer-${farmer.id}`}
                    >
                      Unblock
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {farmers.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No farmers found</p>
        )}
      </div>
    </Layout>
  );
};

export default AdminFarmers;
