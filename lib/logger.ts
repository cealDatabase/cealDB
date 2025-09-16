/**
 * Local File Logger for Frontend Debugging
 * Logs to files since console.log is too fast on Vercel
 */

import fs from 'fs';
import path from 'path';

const LOG_DIR = '/tmp/ceal-logs';

// Ensure log directory exists
if (typeof window === 'undefined') { // Server-side only
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create log directory:', error);
  }
}

export function logToFile(filename: string, message: string, data?: any) {
  if (typeof window !== 'undefined') return; // Client-side skip
  
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data: data || null,
    };
    
    const logPath = path.join(LOG_DIR, `${filename}.json`);
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFileSync(logPath, logLine);
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

export function logSignin(step: string, details: any) {
  logToFile('signin-flow', `SIGNIN_${step}`, details);
}

export function logMiddleware(step: string, details: any) {
  logToFile('middleware', `MIDDLEWARE_${step}`, details);
}

export function logCookies(context: string, cookies: any) {
  logToFile('cookies', `COOKIES_${context}`, cookies);
}
