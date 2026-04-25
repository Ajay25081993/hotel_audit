import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface FormFields {
  name: string;
  username: string;
  email: string;
  role: string;
  password: string;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.name.trim()) errors.name = 'Full name is required';
  if (!fields.username.trim()) errors.username = 'Username is required';
  if (!fields.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(fields.email.trim())) {
    errors.email = 'Invalid email format';
  }
  if (!fields.role) errors.role = 'Role is required';
  if (!fields.password || fields.password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
}

async function createUser(data: FormFields): Promise<void> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
      role: data.role,
      password: data.password,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Failed to create user');
  }
}

const EMPTY: FormFields = { name: '', username: '', email: '', role: '', password: '' };

export default function AddUserPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [fields, setFields] = useState<FormFields>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast({ title: 'User created successfully' });
      setFields(EMPTY);
      setErrors({});
      setApiError(null);
    },
    onError: (err: Error) => {
      setApiError(err.message);
    },
  });

  const handleChange = (field: keyof FormFields) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFields(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleRoleChange = (value: string) => {
    setFields(prev => ({ ...prev, role: value }));
    if (errors.role) setErrors(prev => ({ ...prev, role: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    mutation.mutate(fields);
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-lg mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#2DB5DA' }}>
            Add New User
          </h1>
          <p className="mb-6 text-sm" style={{ color: '#939598' }}>
            Create a new user account and assign a role.
          </p>

          {apiError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#303036' }}>User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1">
                  <Label htmlFor="name" style={{ color: '#303036' }}>Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={fields.name}
                    onChange={handleChange('name')}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <Label htmlFor="username" style={{ color: '#303036' }}>Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. janedoe"
                    value={fields.username}
                    onChange={handleChange('username')}
                    aria-invalid={!!errors.username}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="email" style={{ color: '#303036' }}>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. jane@example.com"
                    value={fields.email}
                    onChange={handleChange('email')}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <Label htmlFor="role" style={{ color: '#303036' }}>Role</Label>
                  <Select value={fields.role} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role" aria-invalid={!!errors.role}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="hotelgm">Hotel GM</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <Label htmlFor="password" style={{ color: '#303036' }}>Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={fields.password}
                    onChange={handleChange('password')}
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setLocation('/admin')}
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 text-white font-semibold"
                    style={{ backgroundColor: '#2DB5DA' }}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating...
                      </span>
                    ) : (
                      'Create User'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
