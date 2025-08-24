// client/src/services/supabase-realtime.ts
type Handler<T = any> = (payload: T) => void;
type Off = () => void;

class RealtimeService {
  on<T = any>(_channel: string, _event: string, _handler: Handler<T>): Off {
    return () => {};
  }
  emit<T = any>(_channel: string, _event: string, _payload: T) {}
}
export const realtimeService = new RealtimeService();