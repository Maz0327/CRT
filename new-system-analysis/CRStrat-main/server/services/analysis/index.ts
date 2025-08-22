import { getProvider, type MediaProvider } from './provider';
import GoogleProvider from './google';
import OpenAIProvider from './openai';
import MockProvider from './mock';

let _provider: MediaProvider | null = null;

export function getMediaProvider(): MediaProvider {
  if (_provider) return _provider;
  const p = getProvider();
  try {
    _provider = p === 'google' ? new GoogleProvider()
      : p === 'openai' ? new OpenAIProvider()
      : new MockProvider();
  } catch {
    _provider = new MockProvider();
  }
  return _provider!;
}