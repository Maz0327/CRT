import { useQuery } from '@tanstack/react-query';

// Simple fetch wrapper that adds auth headers
const api = {
  get: async (url: string) => {
    const response = await fetch(`/api${url}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }
};

export function useCaptureShots(id: string) {
  return useQuery({
    queryKey: ['shots', id],
    queryFn: () => api.get(`/captures/${id}/shots`),
    enabled: !!id
  });
}

export function useCaptureCaptions(id: string) {
  return useQuery({
    queryKey: ['captions', id],
    queryFn: () => api.get(`/captures/${id}/captions`),
    enabled: !!id
  });
}

export function useSimilarCaptures(id: string, k = 6) {
  return useQuery({
    queryKey: ['similar', id, k],
    queryFn: () => api.get(`/search/similar?captureId=${id}&k=${k}`),
    enabled: !!id
  });
}

export function useCaptureTranscript(id: string) {
  return useQuery({
    queryKey: ['transcript', id],
    queryFn: () => api.get(`/captures/${id}/transcript`),
    enabled: !!id
  });
}

export function useCaptureKeyframes(id: string) {
  return useQuery({
    queryKey: ['keyframes', id],
    queryFn: () => api.get(`/captures/${id}/keyframes`),
    enabled: !!id
  });
}