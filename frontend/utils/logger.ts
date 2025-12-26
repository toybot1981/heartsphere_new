/**
 * 统一日志工具
 * 根据环境变量控制日志输出，生产环境自动移除console语句
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

// 获取环境配置
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// 日志级别优先级
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// 默认配置
const defaultConfig: LoggerConfig = {
  level: isDevelopment ? 'debug' : 'error',
  enableConsole: isDevelopment,
  enableRemote: isProduction, // 生产环境可以上报到远程
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 检查是否应该输出日志
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  /**
   * 脱敏处理敏感信息
   */
  private sanitize(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'cookie'];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.config.enableConsole || !this.shouldLog(level)) {
      return;
    }

    const sanitizedArgs = args.map(arg => this.sanitize(arg));
    const formattedMessage = this.formatMessage(level, message, ...sanitizedArgs);

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, ...sanitizedArgs);
        break;
      case 'info':
        console.info(formattedMessage, ...sanitizedArgs);
        break;
      case 'warn':
        console.warn(formattedMessage, ...sanitizedArgs);
        break;
      case 'error':
        console.error(formattedMessage, ...sanitizedArgs);
        break;
    }
  }

  /**
   * 上报到远程（生产环境错误日志）
   */
  private async reportToRemote(level: LogLevel, message: string, ...args: unknown[]): Promise<void> {
    if (!this.config.enableRemote || level !== 'error') {
      return;
    }

    try {
      // 这里可以实现远程日志上报
      // 例如发送到日志服务、监控系统等
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify({ level, message, args }) });
    } catch (error) {
      // 静默失败，避免日志上报本身导致错误
    }
  }

  /**
   * Debug 日志
   */
  debug(message: string, ...args: unknown[]): void {
    this.outputToConsole('debug', message, ...args);
  }

  /**
   * Info 日志
   */
  info(message: string, ...args: unknown[]): void {
    this.outputToConsole('info', message, ...args);
  }

  /**
   * Warning 日志
   */
  warn(message: string, ...args: unknown[]): void {
    this.outputToConsole('warn', message, ...args);
  }

  /**
   * Error 日志
   */
  async error(message: string, ...args: unknown[]): Promise<void> {
    this.outputToConsole('error', message, ...args);
    await this.reportToRemote('error', message, ...args);
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// 导出单例
export const logger = new Logger();

// 导出类型和类
export type { LoggerConfig, LogLevel };
export { Logger };

// 便捷方法
export const log = {
  debug: (message: string, ...args: unknown[]) => logger.debug(message, ...args),
  info: (message: string, ...args: unknown[]) => logger.info(message, ...args),
  warn: (message: string, ...args: unknown[]) => logger.warn(message, ...args),
  error: (message: string, ...args: unknown[]) => logger.error(message, ...args),
};


