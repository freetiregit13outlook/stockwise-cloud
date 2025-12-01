import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Warehouse, Mail, Lock, User, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type AuthMode = 'signin' | 'signup';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    shopName: '',
  });

  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const result = await signIn({ email: formData.email, password: formData.password });
        if (result.success) {
          toast({ title: 'Welcome back!', description: 'Successfully signed in.' });
          navigate('/dashboard');
        } else {
          toast({ title: 'Sign in failed', description: result.error, variant: 'destructive' });
        }
      } else {
        const result = await signUp({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          shopName: formData.shopName,
        });
        if (result.success) {
          toast({ title: 'Account created!', description: result.message });
          setMode('signin');
        } else {
          toast({ title: 'Sign up failed', description: result.error, variant: 'destructive' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Warehouse className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">StockFlow</h1>
          <p className="text-muted-foreground mt-2">Cloud Inventory Management</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="flex mb-6 bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="shopName"
                      placeholder="My Retail Store"
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  required
                  minLength={mode === 'signup' ? 8 : 6}
                />
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {mode === 'signin' && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              <button type="button" className="text-primary hover:underline">
                Forgot password?
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ready for AWS Cognito Integration
        </p>
      </div>
    </div>
  );
}
