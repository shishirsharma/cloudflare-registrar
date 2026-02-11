const inquirer = require('inquirer');
const { COUNTRY_CODES, US_STATES, CA_PROVINCES } = require('../lib/validators');

/**
 * Prompt for API token setup
 */
async function promptForApiToken() {
  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiToken',
      message: 'Enter your Cloudflare API Token:',
      mask: '*',
      validate: (input) => {
        if (!input || input.trim().length < 20) {
          return 'API Token must be at least 20 characters';
        }
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Save this API token?'
    }
  ]);

  return answers;
}

/**
 * Prompt for contact information for a specific contact type
 */
async function promptForContactInfo(currentInfo = null, contactType = 'registrant') {
  const countryChoices = Array.from(COUNTRY_CODES).sort();
  const usStateChoices = Array.from(US_STATES).sort();
  const caProvinceChoices = Array.from(CA_PROVINCES).sort();

  const typeLabel = {
    'registrant': 'Registrant (Domain Owner)',
    'admin': 'Administrator',
    'technical': 'Technical',
    'billing': 'Billing'
  }[contactType] || contactType;

  console.log(`\n📋 Entering ${typeLabel} Contact Information:\n`);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'First Name:',
      default: currentInfo?.first_name || '',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'First name is required';
        }
        if (input.length > 100) {
          return 'First name must be 100 characters or less';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'Last Name:',
      default: currentInfo?.last_name || '',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Last name is required';
        }
        if (input.length > 100) {
          return 'Last name must be 100 characters or less';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      default: currentInfo?.email || '',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
          return 'Email must be valid';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'phone',
      message: 'Phone (E.164 format, e.g., +12025551234):',
      default: currentInfo?.phone || '',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Phone is required';
        }
        if (!/^\+[\d.]+$/.test(input) || input.length < 10) {
          return 'Phone must be in E.164 format (e.g., +12025551234)';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'organization',
      message: 'Organization (optional):',
      default: currentInfo?.organization || ''
    },
    {
      type: 'input',
      name: 'address',
      message: 'Address:',
      default: currentInfo?.address || '',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Address is required';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'address2',
      message: 'Address 2 (optional):',
      default: currentInfo?.address2 || ''
    },
    {
      type: 'input',
      name: 'city',
      message: 'City:',
      default: currentInfo?.city || '',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'City is required';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'country',
      message: 'Country:',
      default: currentInfo?.country || 'US',
      choices: countryChoices
    }
  ]);

  // Conditionally ask for state based on country
  if (answers.country === 'US') {
    const stateAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'state',
        message: 'State:',
        default: currentInfo?.state || 'CA',
        choices: usStateChoices
      }
    ]);
    answers.state = stateAnswer.state;
  } else if (answers.country === 'CA') {
    const provinceAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'state',
        message: 'Province:',
        default: currentInfo?.state || 'ON',
        choices: caProvinceChoices
      }
    ]);
    answers.state = provinceAnswer.state;
  }

  const zipAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'zip',
      message: 'Zip/Postal Code:',
      default: currentInfo?.zip || '',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Zip code is required';
        }
        return true;
      }
    }
  ]);
  answers.zip = zipAnswer.zip;

  const faxAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'fax',
      message: 'Fax (optional, E.164 format, e.g., +12025551234):',
      default: currentInfo?.fax || ''
    }
  ]);
  answers.fax = faxAnswer.fax;

  return answers;
}

/**
 * Prompt for template name
 */
async function promptForTemplateName(existingNames = []) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Template Name:',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Template name is required';
        }
        if (!/^[a-z0-9_-]+$/i.test(input)) {
          return 'Template name must contain only alphanumeric characters, hyphens, and underscores';
        }
        if (existingNames.includes(input.toLowerCase())) {
          return 'Template with this name already exists';
        }
        return true;
      }
    }
  ]);

  return answers.name;
}

/**
 * Confirm an action
 */
async function confirmAction(message) {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message
    }
  ]);

  return answers.confirmed;
}

/**
 * Select from template list
 */
async function selectTemplate(templates) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Select a template:',
      choices: templates
    }
  ]);

  return answers.template;
}

/**
 * Select domains from list
 */
async function selectDomains(domains) {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'domains',
      message: 'Select domains (space to select, enter to confirm):',
      choices: domains,
      validate: (input) => {
        if (input.length === 0) {
          return 'At least one domain must be selected';
        }
        return true;
      }
    }
  ]);

  return answers.domains;
}

/**
 * Prompt for all contact types
 */
async function promptForAllContacts(currentInfo = null) {
  const contactTypes = ['registrant', 'admin', 'technical', 'billing'];
  const contacts = {};

  for (const contactType of contactTypes) {
    const typeLabel = {
      'registrant': 'Registrant (Domain Owner)',
      'admin': 'Administrator',
      'technical': 'Technical',
      'billing': 'Billing'
    }[contactType];

    const useSame = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'same',
        message: `Use same info for ${typeLabel}?`,
        default: contactType !== 'registrant' // Use same for all except registrant on first call
      }
    ]);

    if (useSame.same && contactType !== 'registrant' && contacts.registrant) {
      // Copy registrant info
      contacts[contactType] = { ...contacts.registrant };
    } else {
      // Prompt for new contact info
      const currentContact = currentInfo?.[contactType] || currentInfo?.[contactType === 'registrant' ? 'registrant' : contactType];
      contacts[contactType] = await promptForContactInfo(currentContact, contactType);
    }
  }

  return contacts;
}

module.exports = {
  promptForApiToken,
  promptForContactInfo,
  promptForAllContacts,
  promptForTemplateName,
  confirmAction,
  selectTemplate,
  selectDomains
};
