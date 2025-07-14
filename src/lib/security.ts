import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Validates and sanitizes image URLs
 */
export function validateImageUrl(url: string): { isValid: boolean; sanitized: string } {
  if (!url) return { isValid: true, sanitized: '' };

  try {
    const parsedUrl = new URL(url);
    
    // Check if protocol is https or http
    if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
      return { isValid: false, sanitized: '' };
    }
    
    // Check if the URL looks like an image
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = validExtensions.some(ext => 
      parsedUrl.pathname.toLowerCase().includes(ext)
    );
    
    // Allow common image hosting domains or URLs with valid extensions
    const allowedDomains = ['unsplash.com', 'images.unsplash.com', 'pixabay.com', 'pexels.com'];
    const isAllowedDomain = allowedDomains.some(domain => 
      parsedUrl.hostname.includes(domain)
    );
    
    if (!hasValidExtension && !isAllowedDomain) {
      return { isValid: false, sanitized: '' };
    }
    
    return { isValid: true, sanitized: parsedUrl.href };
  } catch {
    return { isValid: false, sanitized: '' };
  }
}

/**
 * Sanitizes text input to prevent injection attacks
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates price input
 */
export function validatePrice(price: number): { isValid: boolean; error?: string } {
  if (isNaN(price) || price < 0) {
    return { isValid: false, error: 'Price must be a positive number' };
  }
  
  if (price > 9999.99) {
    return { isValid: false, error: 'Price cannot exceed $9999.99' };
  }
  
  return { isValid: true };
}

/**
 * Rate limiting helper for client-side operations
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  checkLimit(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}