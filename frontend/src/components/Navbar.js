import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home,
  Package,
  MessageSquare,
  LayoutDashboard,
  Sprout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'farmer':
        return '/farmer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'consumer':
        return '/consumer/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-harvest-mist">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <Sprout className="h-8 w-8 text-harvest-green" />
            <span className="text-2xl font-bold text-harvest-green">The Modern Harvest</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-harvest-green transition-colors" data-testid="nav-home">
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium hover:text-harvest-green transition-colors" data-testid="nav-products">
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'consumer' && (
                  <Link to="/cart" data-testid="nav-cart">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Cart
                    </Button>
                  </Link>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2" data-testid="user-menu-trigger">
                      <User className="h-4 w-4" />
                      {user?.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(getDashboardPath())} data-testid="menu-dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')} data-testid="menu-orders">
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')} data-testid="menu-messages">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login">
                  <Button variant="outline" size="sm" data-testid="nav-login">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm" 
                    className="bg-harvest-green hover:bg-harvest-green/90 rounded-full"
                    data-testid="nav-register"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-harvest-mist">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/products" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Products
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardPath()} className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/orders" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Orders
                  </Link>
                  <Link to="/messages" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Messages
                  </Link>
                  {user?.role === 'consumer' && (
                    <Link to="/cart" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Cart
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-sm font-medium text-left">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-harvest-green hover:bg-harvest-green/90">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};