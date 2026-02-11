const axios = require('axios');
const axiosRetry = require('axios-retry');
const config = require('./config');
const { APIError, AuthenticationError, RateLimitError } = require('../utils/errors');

const BASE_URL = 'https://api.cloudflare.com/client/v4';

class APIClient {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Setup retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors and 5xx errors
        return (
          !error.response ||
          (error.response.status >= 500 && error.response.status !== 501)
        );
      }
    });

    // Setup request/response interceptors
    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.request.use((requestConfig) => {
      const auth = getAuth();
      if (auth && auth.email && auth.apiKey) {
        // Use Global API Key authentication (required for Registrar API)
        requestConfig.headers['X-Auth-Email'] = auth.email;
        requestConfig.headers['X-Auth-Key'] = auth.apiKey;
      }
      return requestConfig;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new AuthenticationError(
            'Authentication failed. Check your Cloudflare email and Global API Key.'
          );
        }

        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'] || 60;
          throw new RateLimitError(parseInt(retryAfter, 10));
        }

        if (error.response) {
          throw APIError.fromResponse(error.response);
        }

        throw error;
      }
    );
  }

  async getAccountId() {
    try {
      const response = await this.client.get('/accounts');
      const accounts = response.data.result;

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      return accounts[0].id;
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new APIError('Failed to fetch account ID: ' + error.message);
    }
  }

  async ensureAccountId() {
    let accountId = config.getAccountId();
    if (!accountId) {
      accountId = await this.getAccountId();
      config.setAccountId(accountId);
    }
    return accountId;
  }

  async listDomains() {
    try {
      const accountId = await this.ensureAccountId();
      const response = await this.client.get(
        `/accounts/${accountId}/registrar/domains`
      );
      return response.data.result || [];
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new APIError('Failed to list domains: ' + error.message);
    }
  }

  async getDomainRegistrant(domain) {
    try {
      const accountId = await this.ensureAccountId();
      const response = await this.client.get(
        `/accounts/${accountId}/registrar/domains/${domain}`
      );
      return response.data.result || null;
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new APIError(
        `Failed to fetch domain info for ${domain}: ${error.message}`
      );
    }
  }

  async updateDomainRegistrant(domain, contactInfo) {
    try {
      const accountId = await this.ensureAccountId();

      // Build payload: if contactInfo has multiple contact types, use as-is
      // Otherwise, wrap single contact with 'registrant' key
      let payload;
      if (contactInfo.registrant || contactInfo.admin || contactInfo.technical || contactInfo.billing) {
        // Multi-contact structure
        payload = contactInfo;
      } else {
        // Single contact (legacy structure)
        payload = { registrant: contactInfo };
      }

      // Log for debugging (will show in verbose mode)
      if (process.env.DEBUG_API) {
        console.error('[DEBUG API] PUT /accounts/' + accountId + '/registrar/domains/' + domain);
        console.error('[DEBUG API] Payload:', JSON.stringify(payload, null, 2));
      }

      const response = await this.client.put(
        `/accounts/${accountId}/registrar/domains/${domain}`,
        payload
      );

      if (process.env.DEBUG_API) {
        console.error('[DEBUG API] Response:', JSON.stringify(response.data, null, 2));
      }

      return response.data.result || null;
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new APIError(
        `Failed to update domain ${domain}: ${error.message}`
      );
    }
  }
}

/**
 * Helper function to get authentication credentials from config
 */
function getAuth() {
  try {
    const configData = config.getConfig();
    return {
      email: configData.email,
      apiKey: configData.apiKey
    };
  } catch {
    return null;
  }
}

module.exports = new APIClient();
