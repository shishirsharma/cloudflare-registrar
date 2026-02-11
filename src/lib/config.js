const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.cloudflare');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

class ConfigManager {
  constructor() {
    this.configPath = CONFIG_FILE;
    this.configDir = CONFIG_DIR;
  }

  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true, mode: 0o700 });
    }
  }

  ensureConfigExists() {
    this.ensureConfigDir();
    if (!fs.existsSync(this.configPath)) {
      const defaultConfig = {
        email: null,
        apiKey: null,
        accountId: null,
        createdAt: new Date().toISOString()
      };
      fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2), {
        mode: 0o600
      });
    }
  }

  readConfig() {
    this.ensureConfigExists();
    try {
      const content = fs.readFileSync(this.configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read config file: ${error.message}`);
    }
  }

  writeConfig(config) {
    this.ensureConfigDir();
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), {
        mode: 0o600
      });
    } catch (error) {
      throw new Error(`Failed to write config file: ${error.message}`);
    }
  }

  getEmail() {
    const config = this.readConfig();
    return config.email;
  }

  setEmail(email) {
    const config = this.readConfig();
    config.email = email;
    config.updatedAt = new Date().toISOString();
    this.writeConfig(config);
  }

  getApiKey() {
    const config = this.readConfig();
    return config.apiKey;
  }

  setApiKey(apiKey) {
    const config = this.readConfig();
    config.apiKey = apiKey;
    config.updatedAt = new Date().toISOString();
    this.writeConfig(config);
  }

  getAccountId() {
    const config = this.readConfig();
    return config.accountId;
  }

  setAccountId(accountId) {
    const config = this.readConfig();
    config.accountId = accountId;
    config.updatedAt = new Date().toISOString();
    this.writeConfig(config);
  }

  getConfig() {
    return this.readConfig();
  }

  resetConfig() {
    this.ensureConfigDir();
    const defaultConfig = {
      email: null,
      apiKey: null,
      accountId: null,
      createdAt: new Date().toISOString(),
      resettedAt: new Date().toISOString()
    };
    this.writeConfig(defaultConfig);
  }

  isConfigured() {
    try {
      const config = this.readConfig();
      return !!config.email && !!config.apiKey;
    } catch {
      return false;
    }
  }

  getConfigPath() {
    return this.configPath;
  }
}

module.exports = new ConfigManager();
