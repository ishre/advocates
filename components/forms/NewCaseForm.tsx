'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Save, FileText, Sparkles, User, Building, Calendar, DollarSign, Hash } from 'lucide-react';
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
    <div className={`w-full ${variant === 'dialog' ? '' : 'max-w-5xl max-h-[90vh] overflow-y-auto'}`}>
      {variant !== 'dialog' && (
        <Card className="w-full max-h-[90vh] overflow-y-auto">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-2xl">
                  <FileText className="h-6 w-6 mr-3" />
                  Create New Case
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Fill in the case details below to create a new legal case
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Basic Case Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Case Number with inline generate button */}
                  <div className="space-y-2">
                    <Label htmlFor="caseNumber" className="text-sm font-medium">Case Number</Label>
                    <div className="relative">
                      <Input
                        id="caseNumber"
                        value={formData.caseNumber}
                        onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                        placeholder="CASE-2024-0001"
                        className="pr-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, caseNumber: generateCaseNumber() })}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caseType" className="text-sm font-medium">Case Type</Label>
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
                    <Label htmlFor="title" className="text-sm font-medium">Case Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter case title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
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
                  <Label htmlFor="description" className="text-sm font-medium">Case Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide a detailed description of the case"
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Client Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Client Information</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Client</Label>
                    <ClientSelector value={selectedClient} onChange={setSelectedClient} />
                  </div>
                  
                  {selectedClient && (
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{selectedClient.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                          {selectedClient.phone && (
                            <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Court Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Court Information</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="courtName" className="text-sm font-medium">Court Name</Label>
                    <Input
                      id="courtName"
                      value={formData.courtName}
                      onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                      placeholder="Enter court name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courtLocation" className="text-sm font-medium">Court Location</Label>
                    <Input
                      id="courtLocation"
                      value={formData.courtLocation}
                      onChange={(e) => setFormData({ ...formData, courtLocation: e.target.value })}
                      placeholder="Enter court location"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="judgeName" className="text-sm font-medium">Judge Name</Label>
                    <Input
                      id="judgeName"
                      value={formData.judgeName}
                      onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                      placeholder="Enter judge name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opposingParty" className="text-sm font-medium">Opposing Party</Label>
                    <Input
                      id="opposingParty"
                      value={formData.opposingParty}
                      onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
                      placeholder="Enter opposing party name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opposingLawyer" className="text-sm font-medium">Opposing Lawyer</Label>
                    <Input
                      id="opposingLawyer"
                      value={formData.opposingLawyer}
                      onChange={(e) => setFormData({ ...formData, opposingLawyer: e.target.value })}
                      placeholder="Enter opposing lawyer name"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Important Dates - Simplified Layout */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Important Dates</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="filingDate" className="text-sm font-medium">Filing Date *</Label>
                    <Input
                      id="filingDate"
                      type="date"
                      value={formData.filingDate}
                      onChange={(e) => setFormData({ ...formData, filingDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextHearingDate" className="text-sm font-medium">Next Hearing Date</Label>
                    <Input
                      id="nextHearingDate"
                      type="date"
                      value={formData.nextHearingDate}
                      onChange={(e) => setFormData({ ...formData, nextHearingDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadlineDate" className="text-sm font-medium">Deadline Date</Label>
                    <Input
                      id="deadlineDate"
                      type="date"
                      value={formData.deadlineDate}
                      onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Financial Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount" className="text-sm font-medium">Total Amount</Label>
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
                    <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
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
              <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={onClose} className="px-6">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="px-6">
                  {loading ? 'Creating Case...' : 'Create Case'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {variant === 'dialog' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Case Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Case Number with inline generate button */}
              <div className="space-y-2">
                <Label htmlFor="caseNumber" className="text-sm font-medium">Case Number</Label>
                <div className="relative">
                  <Input
                    id="caseNumber"
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    placeholder="CASE-2024-0001"
                    className="pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, caseNumber: generateCaseNumber() })}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caseType" className="text-sm font-medium">Case Type</Label>
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
                <Label htmlFor="title" className="text-sm font-medium">Case Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter case title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
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
              <Label htmlFor="description" className="text-sm font-medium">Case Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of the case"
                rows={4}
                className="resize-none"
                required
              />
            </div>
          </div>

          <Separator />

          {/* Client Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Client Information</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Client</Label>
                <ClientSelector value={selectedClient} onChange={setSelectedClient} />
              </div>
              
              {selectedClient && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{selectedClient.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                      {selectedClient.phone && (
                        <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Selected
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Court Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Court Information</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="courtName" className="text-sm font-medium">Court Name</Label>
                <Input
                  id="courtName"
                  value={formData.courtName}
                  onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                  placeholder="Enter court name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courtLocation" className="text-sm font-medium">Court Location</Label>
                <Input
                  id="courtLocation"
                  value={formData.courtLocation}
                  onChange={(e) => setFormData({ ...formData, courtLocation: e.target.value })}
                  placeholder="Enter court location"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="judgeName" className="text-sm font-medium">Judge Name</Label>
                <Input
                  id="judgeName"
                  value={formData.judgeName}
                  onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                  placeholder="Enter judge name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opposingParty" className="text-sm font-medium">Opposing Party</Label>
                <Input
                  id="opposingParty"
                  value={formData.opposingParty}
                  onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
                  placeholder="Enter opposing party name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opposingLawyer" className="text-sm font-medium">Opposing Lawyer</Label>
                <Input
                  id="opposingLawyer"
                  value={formData.opposingLawyer}
                  onChange={(e) => setFormData({ ...formData, opposingLawyer: e.target.value })}
                  placeholder="Enter opposing lawyer name"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Important Dates - Simplified Layout */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Important Dates</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filingDate" className="text-sm font-medium">Filing Date *</Label>
                <Input
                  id="filingDate"
                  type="date"
                  value={formData.filingDate}
                  onChange={(e) => setFormData({ ...formData, filingDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextHearingDate" className="text-sm font-medium">Next Hearing Date</Label>
                <Input
                  id="nextHearingDate"
                  type="date"
                  value={formData.nextHearingDate}
                  onChange={(e) => setFormData({ ...formData, nextHearingDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadlineDate" className="text-sm font-medium">Deadline Date</Label>
                <Input
                  id="deadlineDate"
                  type="date"
                  value={formData.deadlineDate}
                  onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Financial Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="totalAmount" className="text-sm font-medium">Total Amount</Label>
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
                <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
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
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="px-6">
              {loading ? 'Creating Case...' : 'Create Case'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  if (variant === 'dialog') {
    return formContent;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {formContent}
    </div>
  );
} 