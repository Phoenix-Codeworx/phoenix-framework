import type { IncomingHttpHeaders } from 'node:http';

interface LogObject {
  headers?: { [key: string]: string | string[] | undefined };
  url?: string;
  method?: string;
  [key: string]: any; // This allows for other properties as well
}

export default function sanitizeLog(log: {
  headers?: IncomingHttpHeaders;
  method?: string;
  ip?: string;
  operation?: {};
  url?: string;
}): LogObject {
  const sanitizedLog: LogObject = { ...log };

  // Remove unnecessary properties if they exist
  if (sanitizedLog.url) {
    delete sanitizedLog.url;
  }
  if (sanitizedLog.method) {
    delete sanitizedLog.method;
  }

  // Sanitize headers
  if (sanitizedLog.headers) {
    for (const header in sanitizedLog.headers) {
      switch (header.toLowerCase()) {
        case 'authorization':
          sanitizedLog.headers[header] = 'REDACTED';
          break;
        case 'content-type':
        case 'content-length':
        case 'accept':
          delete sanitizedLog.headers[header];
          break;
      }
    }
  }

  return sanitizedLog;
}
