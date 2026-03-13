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
