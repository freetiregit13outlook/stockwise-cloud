import { useEffect, useState } from 'react';
import { Bell, Mail, Phone, TestTube, Building2, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { alertService } from '@/services/alertService';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationPreferences } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { user, shop } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: false,
    email: '',
    phone: '',
    lowStockThresholdPercent: 100,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await alertService.getPreferences();
        if (response.data) {
          setPreferences(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await alertService.updatePreferences(preferences);
      if (response.data) {
        toast({ title: 'Settings saved successfully' });
      }
    } catch (error) {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAlert = async () => {
    setIsTesting(true);
    try {
      const response = await alertService.sendTestAlert();
      if (response.data?.success) {
        toast({ title: 'Test alert sent', description: response.data.message });
      }
    } catch (error) {
      toast({ title: 'Error sending test alert', variant: 'destructive' });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and notification preferences</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Shop Information</h2>
            <p className="text-sm text-muted-foreground">Your business details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Shop Name</Label>
            <Input value={shop?.name || ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Shop ID</Label>
            <Input value={shop?.id || ''} disabled className="bg-muted font-mono text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Account</h2>
            <p className="text-sm text-muted-foreground">Your personal information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={`${user?.firstName || ''} ${user?.lastName || ''}`} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-muted" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-500/10">
            <Bell className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
            <p className="text-sm text-muted-foreground">Configure SNS notifications</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
            </div>
            <Switch
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, emailEnabled: checked })}
            />
          </div>

          {preferences.emailEnabled && (
            <div className="ml-8 space-y-2">
              <Label htmlFor="alertEmail">Alert Email Address</Label>
              <Input
                id="alertEmail"
                type="email"
                value={preferences.email || ''}
                onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                placeholder="alerts@yourshop.com"
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
              </div>
            </div>
            <Switch
              checked={preferences.smsEnabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, smsEnabled: checked })}
            />
          </div>

          {preferences.smsEnabled && (
            <div className="ml-8 space-y-2">
              <Label htmlFor="alertPhone">Phone Number</Label>
              <Input
                id="alertPhone"
                type="tel"
                value={preferences.phone || ''}
                onChange={(e) => setPreferences({ ...preferences, phone: e.target.value })}
                placeholder="+1 555 123 4567"
              />
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={handleTestAlert} disabled={isTesting}>
            <TestTube className="w-4 h-4 mr-2" />
            {isTesting ? 'Sending...' : 'Send Test Alert'}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">AWS Integration</h2>
        <p className="text-sm text-muted-foreground">
          This application is ready to connect to your AWS backend. Configure the following services:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Amazon Cognito (Authentication)
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            API Gateway (REST API)
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Lambda (Business Logic)
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            DynamoDB (Database)
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            SNS (Notifications)
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            CloudWatch (Monitoring)
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Setup Documentation
          </a>
        </Button>
      </div>
    </div>
  );
}
