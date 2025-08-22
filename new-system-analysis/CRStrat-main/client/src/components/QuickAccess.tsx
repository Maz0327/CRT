import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function QuickAccess() {
  const [, setLocation] = useLocation();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Quick Access - Debug Supabase Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Having trouble accessing the home page? Use this direct link to check your Supabase configuration.
        </p>
        <div className="space-y-2">
          <Button 
            onClick={() => setLocation('/system-status')}
            className="w-full"
          >
            System Status & Health Check
          </Button>
          <Button 
            onClick={() => setLocation('/supabase-test')}
            className="w-full"
            variant="outline"
          >
            Detailed Supabase Connection Test
          </Button>
          
          <Button 
            onClick={() => setLocation('/supabase-setup')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Fix Supabase Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}