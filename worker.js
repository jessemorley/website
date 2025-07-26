// Cloudflare Worker for static site hosting
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle root path
    if (url.pathname === '/') {
      return new Response(await getAsset('index.html'), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Handle specific HTML pages
    if (url.pathname === '/info' || url.pathname === '/info.html') {
      return new Response(await getAsset('info.html'), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    if (url.pathname === '/contact' || url.pathname === '/contact.html') {
      return new Response(await getAsset('contact.html'), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Handle static assets
    const assetPath = url.pathname.slice(1); // Remove leading slash
    
    try {
      const asset = await getAsset(assetPath);
      const contentType = getContentType(assetPath);
      
      return new Response(asset, {
        headers: { 
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (error) {
      // 404 for missing assets
      return new Response('Not Found', { status: 404 });
    }
  }
};

// Get content type based on file extension
function getContentType(path) {
  const ext = path.split('.').pop()?.toLowerCase();
  
  const types = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'txt': 'text/plain',
    'json': 'application/json'
  };
  
  return types[ext] || 'application/octet-stream';
}

// This function will be automatically handled by Wrangler for static assets
async function getAsset(path) {
  // This is a placeholder - Wrangler will replace this with actual asset loading
  throw new Error(`Asset not found: ${path}`);
}