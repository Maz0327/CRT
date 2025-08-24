// client/src/services/supabase-storage.ts
export const storageService = {
  async upload(_path: string, _blob: Blob | File) {
    return { url: '', path: _path };
  },
  async getPublicUrl(_path: string) {
    return { url: '' };
  },
  async remove(_path: string) {
    return { success: true };
  }
};