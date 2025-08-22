import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, BarChart3, Presentation, Folder, CheckCircle } from 'lucide-react';
import { api } from '@/lib/queryClient';

interface GoogleExportPanelProps {
  projectId: string;
  briefId: string;
  briefTitle: string;
}

export function GoogleExportPanel({ projectId, briefId, briefTitle }: GoogleExportPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportTypes, setExportTypes] = useState<string[]>(['slides']);
  const [customTitle, setCustomTitle] = useState(briefTitle);
  const [exportResults, setExportResults] = useState<any>(null);
  const { toast } = useToast();

  const exportOptions = [
    {
      id: 'slides',
      label: 'Google Slides',
      description: 'Professional presentation for stakeholders',
      icon: Presentation,
      recommended: true
    },
    {
      id: 'docs',
      label: 'Google Docs',
      description: 'Detailed strategic analysis document',
      icon: FileText,
      recommended: true
    },
    {
      id: 'sheets',
      label: 'Google Sheets',
      description: 'Data analysis and scoring spreadsheet',
      icon: BarChart3,
      recommended: false
    },
    {
      id: 'drive',
      label: 'Google Drive',
      description: 'Organized project folder with all assets',
      icon: Folder,
      recommended: true
    }
  ];

  const checkAuthStatus = async () => {
    try {
      const response = await api.get<{ authenticated: boolean }>('/google/auth/status');
      setIsAuthenticated(response.authenticated);
      return response.authenticated;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    try {
      const response = await api.get<{ authUrl: string }>('/google/auth/google');
      window.open(response.authUrl, '_blank', 'width=500,height=600');
      
      // Poll for authentication completion
      const pollAuth = setInterval(async () => {
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          setIsAuthenticated(true);
          clearInterval(pollAuth);
          toast({
            title: "Google Authentication Successful",
            description: "You can now export to Google services",
          });
        }
      }, 2000);

      // Stop polling after 60 seconds
      setTimeout(() => {
        clearInterval(pollAuth);
        setAuthLoading(false);
      }, 60000);
    } catch (error) {
      console.error('Error initiating Google auth:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to connect to Google services",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await api.post<{ exports: any[] }>('/google/export', {
        exportSlides: exportTypes.includes('slides'),
        exportDocs: exportTypes.includes('docs'),
        exportSheets: exportTypes.includes('sheets'),
        selectedCaptures: [briefId],
      });

      setExportResults(response.exports);
      toast({
        title: "Export Successful",
        description: `Successfully exported to ${exportTypes.length} Google service(s)`,
      });
    } catch (error: any) {
      console.error('Error exporting to Google:', error);
      
      if (error.authRequired) {
        setIsAuthenticated(false);
        toast({
          title: "Authentication Required",
          description: "Please authenticate with Google to export",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Export Error",
          description: "Failed to export to Google services",
          variant: "destructive",
        });
      }
    } finally {
      setExportLoading(false);
    }
  };

  const toggleExportType = (type: string) => {
    setExportTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Google Services Export</CardTitle>
          <CardDescription>
            Connect to Google to export your strategic brief as professional presentations and documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGoogleAuth} 
            disabled={authLoading}
            className="w-full"
          >
            {authLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect to Google'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Export to Google Services
        </CardTitle>
        <CardDescription>
          Transform your strategic brief into professional Google Workspace documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Custom Title */}
        <div className="space-y-2">
          <Label htmlFor="export-title">Export Title</Label>
          <Input
            id="export-title"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Strategic Intelligence Brief"
          />
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <Label>Export Formats</Label>
          <div className="grid grid-cols-1 gap-3">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = exportTypes.includes(option.id);
              
              return (
                <div
                  key={option.id}
                  className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => toggleExportType(option.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleExportType(option.id)}
                  />
                  <Icon className="h-5 w-5 mt-0.5 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      {option.recommended && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={exportLoading || exportTypes.length === 0}
          className="w-full"
          size="lg"
        >
          {exportLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting to Google...
            </>
          ) : (
            `Export to ${exportTypes.length} Service${exportTypes.length !== 1 ? 's' : ''}`
          )}
        </Button>

        {/* Export Results */}
        {exportResults && (
          <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-200">
              Export Successful!
            </h4>
            <div className="space-y-2">
              {exportResults.slides && (
                <a
                  href={exportResults.slides.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Presentation className="h-4 w-4" />
                  Open Presentation
                </a>
              )}
              {exportResults.docs && (
                <a
                  href={exportResults.docs.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FileText className="h-4 w-4" />
                  Open Document
                </a>
              )}
              {exportResults.sheets && (
                <a
                  href={exportResults.sheets.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <BarChart3 className="h-4 w-4" />
                  Open Spreadsheet
                </a>
              )}
              {exportResults.drive && (
                <a
                  href={exportResults.drive.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Folder className="h-4 w-4" />
                  Open Project Folder
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}