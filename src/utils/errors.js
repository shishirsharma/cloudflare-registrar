class CLIError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.name = this.constructor.name;
    this.exitCode = exitCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class APIError extends CLIError {
  constructor(message, statusCode = null, response = null) {
    super(message, 1);
    this.statusCode = statusCode;
    this.response = response;
  }

  static fromResponse(response) {
    const status = response.status;
    const data = response.data || {};
    const message = data.errors?.[0]?.message || data.message || 'Unknown API error';

    const error = new APIError(message, status, data);
    return error;
  }
}

class AuthenticationError extends CLIError {
  constructor(message = 'Authentication failed. Please check your API token.') {
    super(message, 1);
  }
}

class RateLimitError extends CLIError {
  constructor(retryAfter = null) {
    const message = retryAfter
      ? `Rate limited. Retry after ${retryAfter} seconds.`
      : 'Rate limited. Please try again later.';
    super(message, 1);
    this.retryAfter = retryAfter;
  }
}

class ValidationError extends CLIError {
  constructor(field, message) {
    super(`Validation error: ${field} - ${message}`, 1);
    this.field = field;
  }
}

class ConfigError extends CLIError {
  constructor(message) {
    super(message, 1);
  }
}

class NotFoundError extends CLIError {
  constructor(resource) {
    super(`${resource} not found.`, 1);
  }
}

/**
 * Global error handler for consistent user-facing messages
 */
function handleError(error, logger = null) {
  const log = logger || console;

  if (error instanceof ValidationError) {
    log.error(`❌ ${error.message}`);
  } else if (error instanceof AuthenticationError) {
    log.error(`❌ ${error.message}`);
    log.error('Run: cloudflare-registrar config init');
    log.error('Or create a token at: https://dash.cloudflare.com/profile/api-tokens');
  } else if (error instanceof RateLimitError) {
    log.error(`⏱️  ${error.message}`);
  } else if (error instanceof ConfigError) {
    log.error(`❌ ${error.message}`);
  } else if (error instanceof APIError) {
    log.error(`❌ API Error (${error.statusCode}): ${error.message}`);
  } else if (error instanceof CLIError) {
    log.error(`❌ ${error.message}`);
  } else {
    log.error(`❌ Unexpected error: ${error.message}`);
  }

  return error.exitCode || 1;
}

module.exports = {
  CLIError,
  APIError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ConfigError,
  NotFoundError,
  handleError
};
