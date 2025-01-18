// Browser-friendly logger implementation
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS = {
  debug: '#808080', // gray
  info: '#00ff00',  // green
  warn: '#ffa500',  // orange
  error: '#ff0000'  // red
};

// Log level hierarchy for filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = formatTimestamp();
  const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level.toUpperCase()}] ${message}${metaString}`;
}

function shouldLog(messageLevel: LogLevel): boolean {
  const currentLogLevel = getLogLevel() as LogLevel;
  return LOG_LEVELS[messageLevel] >= LOG_LEVELS[currentLogLevel];
}

function logToConsole(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  // Only log if the message level is at or above the current log level
  if (!shouldLog(level)) {
    return;
  }

  const formattedMessage = formatMessage(level, message, meta);
  const style = `color: ${LOG_COLORS[level]}`;
  
  switch (level) {
    case 'debug':
      console.debug(`%c${formattedMessage}`, style);
      break;
    case 'info':
      console.info(`%c${formattedMessage}`, style);
      break;
    case 'warn':
      console.warn(`%c${formattedMessage}`, style);
      break;
    case 'error':
      console.error(`%c${formattedMessage}`, style);
      break;
  }
}

export const logMethodEntry = (methodName: string, args: unknown = {}): void => {
  logToConsole('debug', `Entering ${methodName}`, { args });
};

export const logMethodExit = (methodName: string, result: unknown = {}): void => {
  logToConsole('debug', `Exiting ${methodName}`, { result });
};

export const logError = (error: Error, context: string): void => {
  logToConsole('error', `Error in ${context}: ${error.message}`, {
    stack: error.stack,
    context
  });
};

export const logInfo = (message: string, meta: Record<string, unknown> = {}): void => {
  logToConsole('info', message, meta);
};

export const logWarning = (message: string, meta: Record<string, unknown> = {}): void => {
  logToConsole('warn', message, meta);
};

export const logDebug = (message: string, meta: Record<string, unknown> = {}): void => {
  logToConsole('debug', message, meta);
};

// Create a custom ESLint rule helper
export const getLogLevel = (): string => 
  window.location.hostname === 'localhost' ? 'debug' : 'warn'; 