const Conf = require('conf');
const path = require('path');
const os = require('os');
const { validateContactInfo, normalizeContactInfo } = require('./validators');
const { ConfigError } = require('../utils/errors');

const CONFIG_DIR = path.join(os.homedir(), '.cloudflare');

class TemplateManager {
  constructor() {
    this.config = new Conf({
      projectName: 'cloudflare-registrar',
      projectSuffix: '',
      cwd: CONFIG_DIR,
      configName: 'templates'
    });
  }

  /**
   * Save a contact template
   */
  saveTemplate(name, contactInfo) {
    // Validate template name
    if (!name || typeof name !== 'string') {
      throw new ConfigError('Template name must be a non-empty string');
    }

    if (!/^[a-z0-9_-]+$/i.test(name)) {
      throw new ConfigError('Template name must contain only alphanumeric characters, hyphens, and underscores');
    }

    // Validate contact info
    const errors = validateContactInfo(contactInfo);
    if (errors) {
      throw new ConfigError(`Invalid contact info: ${errors.join(', ')}`);
    }

    // Normalize and save
    const normalized = normalizeContactInfo(contactInfo);
    this.config.set(`templates.${name}`, {
      ...normalized,
      savedAt: new Date().toISOString()
    });
  }

  /**
   * Load a contact template
   */
  loadTemplate(name) {
    const templates = this.config.get('templates') || {};
    const template = templates[name];

    if (!template) {
      throw new ConfigError(`Template "${name}" not found`);
    }

    // Remove metadata fields
    const { savedAt, ...contactInfo } = template;
    return contactInfo;
  }

  /**
   * List all templates
   */
  listTemplates() {
    const templates = this.config.get('templates') || {};
    return Object.keys(templates).map((name) => ({
      name,
      ...templates[name]
    }));
  }

  /**
   * Delete a template
   */
  deleteTemplate(name) {
    const templates = this.config.get('templates') || {};
    if (!templates[name]) {
      throw new ConfigError(`Template "${name}" not found`);
    }
    delete templates[name];
    this.config.set('templates', templates);
  }

  /**
   * Template exists check
   */
  templateExists(name) {
    const templates = this.config.get('templates') || {};
    return !!templates[name];
  }

  /**
   * Get all template names
   */
  getTemplateNames() {
    const templates = this.config.get('templates') || {};
    return Object.keys(templates);
  }
}

module.exports = new TemplateManager();
