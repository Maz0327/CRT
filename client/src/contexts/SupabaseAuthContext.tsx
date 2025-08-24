export function useSupabaseAuth() { return { user: null }; }
export const SupabaseAuthProvider = ({ children }: {children: any}) => children;