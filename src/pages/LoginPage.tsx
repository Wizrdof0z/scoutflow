import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Query the users table to find matching email (case-insensitive)
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email.trim())
        .limit(1);

      if (queryError) throw queryError;

      if (!users || users.length === 0) {
        setError('Invalid username or password');
        setLoading(false);
        return;
      }

      const dbUser = users[0];

      // Simple password check: username should match password
      // e.g., jeroen/jeroen, kyle/kyle, etc.
      if (password.toLowerCase() === dbUser.email.toLowerCase()) {
        // Map database user to User type
        const user: User = {
          userID: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          createdAt: dbUser.created_at || new Date().toISOString(),
        };

        // Set user in auth store
        authStore.login(user.email, password);
        
        // Update the store with the actual user data
        useAuthStore.setState({ 
          user, 
          isAuthenticated: true 
        });

        // Redirect to home page
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ScoutFlow</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email">Username</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jeroen"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
