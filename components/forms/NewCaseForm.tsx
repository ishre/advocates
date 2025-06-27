'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Save, User, Calendar, MapPin, Building, FileText } from 'lucide-react';

interface NewCaseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export default function NewCaseForm({ onClose, onSuccess }: NewCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    description: '',
    caseType: '',
    priority: 'medium',
    courtName: '',
    courtLocation: '',
    judgeName: '',
    opposingParty: '',
    opposingLawyer: '',
    filingDate: '',
    nextHearingDate: '',
    deadlineDate: '',
    totalAmount: 0,
    currency: 'USD',
  });

  const [newClientData, setNewClientData] = useState({
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
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
    clientType: 'individual',
    status: 'active',
  });

  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Find the selected client details
      const client = clients.find((c) => c._id === selectedClient);
      if (!client) {
        setError('Please select a client.');
        setLoading(false);
        return;
      }
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clientId: selectedClient,
          clientName: client.name,
          clientEmail: client.email,
          clientPhone: client.phone,
          fees: {
            totalAmount: formData.totalAmount,
            paidAmount: 0,
            pendingAmount: formData.totalAmount,
            currency: formData.currency,
          },
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create case');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClientData),
      });

      if (response.ok) {
        const newClient = await response.json();
        setClients([...clients, newClient.client]);
        setSelectedClient(newClient.client._id);
        setShowNewClientForm(false);
        setNewClientData({ name: '', email: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: '' }, emergencyContact: { name: '', relationship: '', phone: '', email: '' }, clientType: 'individual', status: 'active' });
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

  const generateCaseNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CASE-${year}-${random}`;
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <Save className="h-5 w-5 mr-2" />
              Case Created Successfully!
            </CardTitle>
            <CardDescription>
              The case has been created and added to your dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                New Case
              </CardTitle>
              <CardDescription>
                Create a new legal case with all necessary details
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

            {/* Basic Case Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caseNumber">Case Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="caseNumber"
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    placeholder="CASE-2024-0001"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, caseNumber: generateCaseNumber() })}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caseType">Case Type</Label>
                <Select value={formData.caseType} onValueChange={(value) => setFormData({ ...formData, caseType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="criminal">Criminal</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Case Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter case title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Case Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of the case"
                rows={4}
                required
              />
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Client Information
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                >
                  {showNewClientForm ? 'Select Existing' : 'Add New Client'}
                </Button>
              </div>

              {showNewClientForm ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">New Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientName">Name</Label>
                        <Input
                          id="clientName"
                          value={newClientData.name}
                          onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                          placeholder="Client name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientEmail">Email</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          value={newClientData.email}
                          onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                          placeholder="client@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientPhone">Phone</Label>
                        <Input
                          id="clientPhone"
                          value={newClientData.phone}
                          onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientAddress">Address</Label>
                        <Input
                          id="clientAddress"
                          value={newClientData.address.street}
                          onChange={(e) => setNewClientData({ ...newClientData, address: { ...newClientData.address, street: e.target.value } })}
                          placeholder="Street"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientCity">City</Label>
                        <Input
                          id="clientCity"
                          value={newClientData.address.city}
                          onChange={(e) => setNewClientData({ ...newClientData, address: { ...newClientData.address, city: e.target.value } })}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientState">State</Label>
                        <Input
                          id="clientState"
                          value={newClientData.address.state}
                          onChange={(e) => setNewClientData({ ...newClientData, address: { ...newClientData.address, state: e.target.value } })}
                          placeholder="State"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientZipCode">Zip Code</Label>
                        <Input
                          id="clientZipCode"
                          value={newClientData.address.zipCode}
                          onChange={(e) => setNewClientData({ ...newClientData, address: { ...newClientData.address, zipCode: e.target.value } })}
                          placeholder="Zip Code"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientCountry">Country</Label>
                        <Input
                          id="clientCountry"
                          value={newClientData.address.country}
                          onChange={(e) => setNewClientData({ ...newClientData, address: { ...newClientData.address, country: e.target.value } })}
                          placeholder="Country"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientEmergencyContactName">Emergency Contact Name</Label>
                        <Input
                          id="clientEmergencyContactName"
                          value={newClientData.emergencyContact.name}
                          onChange={(e) => setNewClientData({ ...newClientData, emergencyContact: { ...newClientData.emergencyContact, name: e.target.value } })}
                          placeholder="Emergency Contact Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientEmergencyContactRelationship">Emergency Contact Relationship</Label>
                        <Input
                          id="clientEmergencyContactRelationship"
                          value={newClientData.emergencyContact.relationship}
                          onChange={(e) => setNewClientData({ ...newClientData, emergencyContact: { ...newClientData.emergencyContact, relationship: e.target.value } })}
                          placeholder="Emergency Contact Relationship"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientEmergencyContactPhone">Emergency Contact Phone</Label>
                        <Input
                          id="clientEmergencyContactPhone"
                          value={newClientData.emergencyContact.phone}
                          onChange={(e) => setNewClientData({ ...newClientData, emergencyContact: { ...newClientData.emergencyContact, phone: e.target.value } })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientEmergencyContactEmail">Emergency Contact Email</Label>
                        <Input
                          id="clientEmergencyContactEmail"
                          type="email"
                          value={newClientData.emergencyContact.email}
                          onChange={(e) => setNewClientData({ ...newClientData, emergencyContact: { ...newClientData.emergencyContact, email: e.target.value } })}
                          placeholder="emergency@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientType">Client Type</Label>
                        <Select value={newClientData.clientType} onValueChange={(value) => setNewClientData({ ...newClientData, clientType: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="corporation">Corporation</SelectItem>
                            <SelectItem value="government">Government</SelectItem>
                            <SelectItem value="non-profit">Non-Profit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientStatus">Client Status</Label>
                        <Select value={newClientData.status} onValueChange={(value) => setNewClientData({ ...newClientData, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Client'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="client">Select Client</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.name} ({client.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Court Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courtName">Court Name</Label>
                <Input
                  id="courtName"
                  value={formData.courtName}
                  onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                  placeholder="District Court"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courtLocation">Court Location</Label>
                <Input
                  id="courtLocation"
                  value={formData.courtLocation}
                  onChange={(e) => setFormData({ ...formData, courtLocation: e.target.value })}
                  placeholder="City, State"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="judgeName">Judge Name</Label>
                <Input
                  id="judgeName"
                  value={formData.judgeName}
                  onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                  placeholder="Judge's name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opposingParty">Opposing Party</Label>
                <Input
                  id="opposingParty"
                  value={formData.opposingParty}
                  onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
                  placeholder="Opposing party name"
                />
              </div>
            </div>

            {/* Important Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filingDate">Filing Date</Label>
                <Input
                  id="filingDate"
                  type="date"
                  value={formData.filingDate}
                  onChange={(e) => setFormData({ ...formData, filingDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextHearingDate">Next Hearing Date</Label>
                <Input
                  id="nextHearingDate"
                  type="datetime-local"
                  value={formData.nextHearingDate}
                  onChange={(e) => setFormData({ ...formData, nextHearingDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadlineDate">Deadline Date</Label>
                <Input
                  id="deadlineDate"
                  type="date"
                  value={formData.deadlineDate}
                  onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Fee Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !selectedClient}>
                {loading ? 'Creating...' : 'Create Case'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 