#!/bin/bash

# Farmer Dashboard
cat > /app/frontend/src/pages/farmer/Dashboard.js << 'EOF'
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
EOF

# Farmer Products Page
cat > /app/frontend/src/pages/farmer/Products.js << 'EOF'
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const FarmerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg',
    stock: '',
    is_organic: false,
    images: ['']
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/farmer/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Vegetables',
      price: '',
      unit: 'kg',
      stock: '',
      is_organic: false,
      images: ['']
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseFloat(formData.stock),
        images: formData.images.filter(img => img.trim() !== '')
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', data);
        toast.success('Product added successfully!');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      stock: product.stock.toString(),
      is_organic: product.is_organic,
      images: product.images.length > 0 ? product.images : ['']
    });
    setDialogOpen(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Products</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-harvest-green hover:bg-harvest-green/90 rounded-full" onClick={resetForm} data-testid="add-product-button">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Product Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required data-testid="product-name-input" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required data-testid="product-description-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger data-testid="product-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vegetables">Vegetables</SelectItem>
                        <SelectItem value="Fruits">Fruits</SelectItem>
                        <SelectItem value="Dairy">Dairy</SelectItem>
                        <SelectItem value="Grains">Grains</SelectItem>
                        <SelectItem value="Herbs">Herbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="liter">liter</SelectItem>
                        <SelectItem value="dozen">dozen</SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (₹)</Label>
                    <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required data-testid="product-price-input" />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input type="number" step="0.1" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required data-testid="product-stock-input" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.is_organic} onCheckedChange={(checked) => setFormData({...formData, is_organic: checked})} data-testid="product-organic-checkbox" />
                  <Label>Organic Product</Label>
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={formData.images[0]} onChange={(e) => setFormData({...formData, images: [e.target.value]})} placeholder="https://example.com/image.jpg" data-testid="product-image-input" />
                </div>
                <Button type="submit" className="w-full bg-harvest-green hover:bg-harvest-green/90" data-testid="save-product-button">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products yet. Add your first product to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} data-testid={`product-${product.id}`}>
                <CardContent className="p-6">
                  <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1613061527119-56ad37b8a581'} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-harvest-green">₹{product.price}/{product.unit}</span>
                    <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(product)} data-testid={`edit-product-${product.id}`}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-red-500 hover:text-red-700" onClick={() => handleDelete(product.id)} data-testid={`delete-product-${product.id}`}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
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

export default FarmerProducts;
EOF

# Consumer Dashboard
cat > /app/frontend/src/pages/consumer/Dashboard.js << 'EOF'
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
EOF

# Admin Dashboard
cat > /app/frontend/src/pages/admin/Dashboard.js << 'EOF'
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
EOF

# Admin Farmers Page
cat > /app/frontend/src/pages/admin/Farmers.js << 'EOF'
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
EOF

echo "All dashboard pages created successfully"
