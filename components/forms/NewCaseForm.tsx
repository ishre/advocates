'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Save, FileText } from 'lucide-react';
import ClientSelector from "@/components/cases/CaseFormFields/ClientSelector";

interface NewCaseFormProps {
  onClose: () => void;
  onSuccess: () => void;
  variant?: 'overlay' | 'dialog';
}

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export default function NewCaseForm({ onClose, onSuccess, variant = 'overlay' }: NewCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedClient) {
        setError('Please select a client.');
        setLoading(false);
        return;
      }
      const requestBody = {
        ...formData,
        clientId: selectedClient._id,
        clientName: selectedClient.name,
        clientEmail: selectedClient.email,
        clientPhone: selectedClient.phone,
        registrationDate: formData.filingDate,
        fees: {
          totalAmount: formData.totalAmount,
          paidAmount: 0,
          pendingAmount: formData.totalAmount,
          currency: formData.currency,
        },
      };
      console.log('Submitting case:', requestBody);
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Create case error:', errorData);
        throw new Error(errorData.error || 'Failed to create case');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create case');
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
    if (variant === 'dialog') {
      return (
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
      );
    }
    
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

  const formContent = (
    <Card className={`w-full ${variant === 'dialog' ? 'max-h-[80vh] overflow-y-auto' : 'max-w-4xl max-h-[90vh] overflow-y-auto'}`}>
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
          {variant !== 'dialog' && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
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
                Client Information
              </Label>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <Label htmlFor="client" className="md:w-32 whitespace-nowrap">Select Client</Label>
              <div className="flex-1 min-w-0">
                <ClientSelector value={selectedClient} onChange={setSelectedClient} />
              </div>
            </div>
          </div>

          {/* Court Information */}
          <div className="space-y-4">
            <Label className="flex items-center">
              Court Information
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courtName">Court Name</Label>
                <Input
                  id="courtName"
                  value={formData.courtName}
                  onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                  placeholder="Enter court name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courtLocation">Court Location</Label>
                <Input
                  id="courtLocation"
                  value={formData.courtLocation}
                  onChange={(e) => setFormData({ ...formData, courtLocation: e.target.value })}
                  placeholder="Enter court location"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="judgeName">Judge Name</Label>
                <Input
                  id="judgeName"
                  value={formData.judgeName}
                  onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                  placeholder="Enter judge name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opposingParty">Opposing Party</Label>
                <Input
                  id="opposingParty"
                  value={formData.opposingParty}
                  onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
                  placeholder="Enter opposing party name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opposingLawyer">Opposing Lawyer</Label>
                <Input
                  id="opposingLawyer"
                  value={formData.opposingLawyer}
                  onChange={(e) => setFormData({ ...formData, opposingLawyer: e.target.value })}
                  placeholder="Enter opposing lawyer name"
                />
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className="space-y-4">
            <Label className="flex items-center">
              Important Dates
            </Label>
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
                  type="date"
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
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <Label className="flex items-center">
              Financial Information
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Case...' : 'Create Case'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  if (variant === 'dialog') {
    return formContent;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {formContent}
    </div>
  );
} 