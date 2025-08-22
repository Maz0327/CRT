import { useState } from 'react';
import { storageService } from '../services/supabase-storage';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from './use-toast';

export function useFileUpload() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadCaptureMedia = async (file: File, captureId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const result = await storageService.uploadCaptureMedia(file, captureId, user.id);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result) {
        toast({
          title: "Upload successful",
          description: `File uploaded: ${file.name}`,
        });
      } else {
        throw new Error('Upload failed');
      }

      return result;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadBriefDocument = async (file: File, briefId: string) => {
    if (!user) return null;

    setUploading(true);
    try {
      const result = await storageService.uploadBriefDocument(file, briefId, user.id);
      
      if (result) {
        toast({
          title: "Brief uploaded",
          description: "Your DSD brief has been saved",
        });
      }

      return result;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload brief document",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;

    setUploading(true);
    try {
      const url = await storageService.uploadUserAvatar(file, user.id);
      
      if (url) {
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated",
        });
      }

      return url;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to update avatar",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const batchUpload = async (files: File[], captureId: string) => {
    if (!user) return [];

    setUploading(true);
    setProgress(0);

    try {
      const totalFiles = files.length;
      let completed = 0;

      // Upload files with progress tracking
      const results = await Promise.all(
        files.map(async (file) => {
          const result = await storageService.uploadCaptureMedia(file, captureId, user.id);
          completed++;
          setProgress((completed / totalFiles) * 100);
          return result;
        })
      );

      toast({
        title: "Batch upload complete",
        description: `Uploaded ${completed} of ${totalFiles} files`,
      });

      return results.filter((r): r is NonNullable<typeof r> => r !== null);
    } catch (error) {
      toast({
        title: "Batch upload failed",
        description: "Some files could not be uploaded",
        variant: "destructive",
      });
      return [];
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadCaptureMedia,
    uploadBriefDocument,
    uploadAvatar,
    batchUpload,
    uploading,
    progress,
  };
}

export function useStorageUsage() {
  const { user } = useSupabaseAuth();
  const [usage, setUsage] = useState<{
    captures: number;
    briefs: number;
    exports: number;
    total: number;
  }>({
    captures: 0,
    briefs: 0,
    exports: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchUsage = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const storageUsage = await storageService.getUserStorageUsage(user.id);
      setUsage(storageUsage);
    } catch (error) {
      console.error('Error fetching storage usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    usage,
    loading,
    fetchUsage,
    formatBytes,
  };
}