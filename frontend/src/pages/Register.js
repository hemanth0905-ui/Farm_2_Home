import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    role: 'consumer',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      toast.success(formData.role === 'farmer' 
        ? 'Registration successful! Pending admin approval.'
        : 'Registration successful!');
      
      if (formData.role === 'farmer') {
        navigate('/login');
      } else if (formData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/products');
      }
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Join our community of farmers and consumers
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  data-testid="register-name-input"
                  className="bg-white border-harvest-mist focus:border-harvest-green focus:ring-1 focus:ring-harvest-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  data-testid="register-email-input"
                  className="bg-white border-harvest-mist focus:border-harvest-green focus:ring-1 focus:ring-harvest-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  data-testid="register-password-input"
                  className="bg-white border-harvest-mist focus:border-harvest-green focus:ring-1 focus:ring-harvest-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  data-testid="register-phone-input"
                  className="bg-white border-harvest-mist focus:border-harvest-green focus:ring-1 focus:ring-harvest-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  data-testid="register-location-input"
                  className="bg-white border-harvest-mist focus:border-harvest-green focus:ring-1 focus:ring-harvest-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger data-testid="register-role-select" className="bg-white border-harvest-mist focus:border-harvest-green focus:ring-1 focus:ring-harvest-green">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumer" data-testid="role-consumer">Consumer</SelectItem>
                    <SelectItem value="farmer" data-testid="role-farmer">Farmer/Vendor</SelectItem>
                  </SelectContent>
                </Select>
                {formData.role === 'farmer' && (
                  <p className="text-xs text-muted-foreground">
                    Note: Farmer accounts require admin approval before you can start selling.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-harvest-green hover:bg-harvest-green/90 rounded-full"
                disabled={loading}
                data-testid="register-submit-button"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-harvest-green font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;