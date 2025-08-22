import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fetch from 'node-fetch';

export async function extractFromUrl(url: string) {
  const res = await fetch(url, { 
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TruthLabBot/1.0; +https://contentradarzw.com/bot)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  });
  
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const html = await res.text();
  
  // Basic fallback if Readability fails
  const dom = new JSDOM(html, { url });
  
  try {
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const text = article?.textContent?.trim() || '';
    
    if (text.length > 100) {
      // Readability successful
      const imgs = [...dom.window.document.images]
        .slice(0, 5)
        .map((img) => ({ url: img.src }))
        .filter((x) => !!x.url);
      
      return { extracted_text: text, extracted_images: imgs };
    }
  } catch (readabilityError) {
    console.warn('Readability failed, using fallback extraction:', readabilityError);
  }
  
  // Fallback: extract from common elements
  const document = dom.window.document;
  const textElements = [
    ...document.querySelectorAll('p'),
    ...document.querySelectorAll('article'),
    ...document.querySelectorAll('main'),
    ...document.querySelectorAll('.content'),
    ...document.querySelectorAll('[role="main"]')
  ];
  
  const fallbackText = textElements
    .map(el => el.textContent?.trim())
    .filter(text => text && text.length > 20)
    .join(' ')
    .slice(0, 5000);
  
  const imgs = [...document.images]
    .slice(0, 5)
    .map((img) => ({ url: img.src }))
    .filter((x) => !!x.url);
  
  return { 
    extracted_text: fallbackText || 'Content extraction completed but no readable text found.', 
    extracted_images: imgs 
  };
}