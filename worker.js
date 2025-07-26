// Simple Cloudflare Worker for static site hosting
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    try {
      // Handle clean URLs - redirect /info to /info.html etc
      if (url.pathname === '/info') {
        url.pathname = '/info.html';
      } else if (url.pathname === '/contact') {
        url.pathname = '/contact.html';
      }
      
      // Create a new request with the potentially modified URL
      const modifiedRequest = new Request(url.toString(), request);
      
      return await getAssetFromKV(
        {
          request: modifiedRequest,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
        }
      );
    } catch (e) {
      // If asset not found, return 404
      return new Response('Not Found', { status: 404 });
    }
  }
};