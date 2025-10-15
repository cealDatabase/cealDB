/**
 * Debug Logs API - View persistent logs from signin process
 * This creates a web-accessible endpoint to view logs in Vercel
 */

import { NextRequest, NextResponse } from 'next/server';

// Global log storage (in-memory for this session)
declare global {
  var debugLogs: any[] | undefined;
}

globalThis.debugLogs = globalThis.debugLogs || [];

export function logDebug(category: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    category,
    message,
    data,
    id: Math.random().toString(36).substr(2, 9)
  };
  
  // Store in global array
  globalThis.debugLogs!.push(logEntry);
  
  // Keep only last 100 logs to prevent memory issues
  if (globalThis.debugLogs!.length > 100) {
    globalThis.debugLogs = globalThis.debugLogs!.slice(-100);
  }
  
  // Also log to console for Vercel Function Logs
  console.log(`[${category}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  if (action === 'clear') {
    globalThis.debugLogs = [];
    return NextResponse.json({ success: true, message: 'Logs cleared' });
  }
  
  // Return logs as HTML for easy viewing
  const logs = globalThis.debugLogs || [];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Debug Logs - CEAL Statistics Database</title>
      <style>
        body { font-family: monospace; margin: 20px; background: #1a1a1a; color: #00ff00; }
        .log-entry { margin: 10px 0; padding: 10px; border-left: 3px solid #00ff00; background: #2a2a2a; }
        .timestamp { color: #888; font-size: 0.9em; }
        .category { color: #ffff00; font-weight: bold; }
        .message { color: #00ff00; margin: 5px 0; }
        .data { color: #ccc; background: #333; padding: 5px; margin: 5px 0; overflow-x: auto; }
        .controls { margin: 20px 0; }
        .btn { background: #007bff; color: white; padding: 8px 16px; border: none; cursor: pointer; margin-right: 10px; }
        .btn:hover { background: #0056b3; }
      </style>
      <script>
        function clearLogs() {
          fetch('?action=clear').then(() => location.reload());
        }
        function autoRefresh() {
          setTimeout(() => location.reload(), 2000);
        }
      </script>
    </head>
    <body>
      <h1>🔧 CEAL Statistics Database Debug Logs</h1>
      <div class="controls">
        <button class="btn" onclick="location.reload()">Refresh</button>
        <button class="btn" onclick="clearLogs()">Clear Logs</button>
        <button class="btn" onclick="autoRefresh()">Auto Refresh (2s)</button>
        <span style="color: #888; margin-left: 20px;">Total logs: ${logs.length}</span>
      </div>
      
      ${logs.length === 0 ? 
        '<p style="color: #888;">No logs yet. Perform a signin to see debug information.</p>' :
        logs.map(log => `
          <div class="log-entry">
            <div class="timestamp">${log.timestamp}</div>
            <div class="category">[${log.category}]</div>
            <div class="message">${log.message}</div>
            ${log.data ? `<pre class="data">${JSON.stringify(log.data, null, 2)}</pre>` : ''}
          </div>
        `).join('')
      }
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
