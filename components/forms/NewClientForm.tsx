'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Save, User, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';

interface NewClientFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewClientForm({ onClose, onSuccess }: NewClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    dateOfBirth: '',
    occupation: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
    clientType: 'individual',
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <Save className="h-5 w-5 mr-2" />
              Client Created Successfully!
            </CardTitle>
            <CardDescription>
              The client has been created and added to your database.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                New Client
              </CardTitle>
              <CardDescription>
                Add a new client to your database
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientType">Client Type</Label>
                <select
                  id="clientType"
                  value={formData.clientType}
                  onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="individual">Individual</option>
                  <option value="corporate">Corporate</option>
                  <option value="government">Government</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                  <option value="former">Former</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Address</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                    placeholder="Zip Code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Emergency Contact</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                    })}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                    })}
                    placeholder="Spouse, Parent, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                    })}
                    placeholder="Emergency contact phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyEmail">Email</Label>
                  <Input
                    id="emergencyEmail"
                    type="email"
                    value={formData.emergencyContact.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, email: e.target.value }
                    })}
                    placeholder="emergency@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 