'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Save, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface HearingSchedulerProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Case {
  _id: string;
  caseNumber: string;
  title: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function HearingScheduler({ onClose, onSuccess }: HearingSchedulerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const { data: session } = useSession();
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  const [formData, setFormData] = useState({
    caseId: '',
    hearingType: '',
    date: '',
    time: '',
    duration: '60',
    courtRoom: '',
    judgeName: '',
    description: '',
    attendees: '',
    notes: '',
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases?status=active&limit=50');
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/hearings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          caseId: selectedCase,
          dateTime: `${formData.date}T${formData.time}`,
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
        throw new Error(errorData.error || 'Failed to schedule hearing');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to schedule hearing');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailStatus(null);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: session?.user?.email || 'test@example.com',
          subject: 'Test Email',
          html: '<p>This is a <b>test email</b> from Legal Case Manager.</p>',
          text: 'This is a test email from Legal Case Manager.',
          type: 'custom',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestEmailStatus('Test email sent successfully!');
      } else {
        setTestEmailStatus(data.error || 'Failed to send test email.');
      }
    } catch (err) {
      setTestEmailStatus('Failed to send test email.');
    } finally {
      setTestEmailLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <Save className="h-5 w-5 mr-2" />
              Hearing Scheduled Successfully!
            </CardTitle>
            <CardDescription>
              The hearing has been scheduled and added to your calendar.
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
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Hearing
              </CardTitle>
              <CardDescription>
                Schedule a new hearing for a case
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

            {/* Case Selection */}
            <div className="space-y-2">
              <Label htmlFor="case">Select Case *</Label>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((caseItem) => (
                    <SelectItem key={caseItem._id} value={caseItem._id}>
                      {caseItem.caseNumber} - {caseItem.title} ({caseItem.clientId.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hearing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hearingType">Hearing Type *</Label>
                <Select value={formData.hearingType} onValueChange={(value) => setFormData({ ...formData, hearingType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hearing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial Hearing</SelectItem>
                    <SelectItem value="preliminary">Preliminary Hearing</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="sentencing">Sentencing</SelectItem>
                    <SelectItem value="motion">Motion Hearing</SelectItem>
                    <SelectItem value="settlement">Settlement Conference</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="300">5 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courtRoom">Court Room</Label>
                <Input
                  id="courtRoom"
                  value={formData.courtRoom}
                  onChange={(e) => setFormData({ ...formData, courtRoom: e.target.value })}
                  placeholder="Court Room 101"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the hearing"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees">Attendees</Label>
              <Textarea
                id="attendees"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                placeholder="List of attendees (client, witnesses, etc.)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes or instructions"
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !selectedCase}>
                {loading ? 'Scheduling...' : 'Schedule Hearing'}
              </Button>
            </div>
          </form>
          {/* Test Email Button */}
          <div className="mt-6 flex flex-col items-center">
            <Button type="button" variant="outline" onClick={handleTestEmail} disabled={testEmailLoading}>
              {testEmailLoading ? 'Sending Test Email...' : 'Send Test Email'}
            </Button>
            {testEmailStatus && (
              <div className={`mt-2 text-sm ${testEmailStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{testEmailStatus}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 