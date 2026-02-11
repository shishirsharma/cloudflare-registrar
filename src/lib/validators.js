const validator = require('validator');

const REQUIRED_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'address',
  'city',
  'zip',
  'country'
];

const OPTIONAL_FIELDS = ['organization', 'address2', 'state', 'fax'];

const COUNTRY_CODES = new Set([
  'US', 'GB', 'CA', 'AU', 'NZ', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH',
  'AT', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'RO', 'GR', 'PT', 'IE',
  'JP', 'CN', 'IN', 'BR', 'MX', 'KR', 'SG', 'HK', 'NL', 'RU', 'ZA', 'AE'
]);

// State codes for US and CA
const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
]);

const CA_PROVINCES = new Set([
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
]);

/**
 * Validate contact information
 * @param {Object} contact - Contact info object
 * @returns {Array|null} Array of error messages or null if valid
 */
function validateContactInfo(contact) {
  const errors = [];

  if (!contact || typeof contact !== 'object') {
    return ['Contact info must be an object'];
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!contact[field] || String(contact[field]).trim() === '') {
      errors.push(`${field} is required`);
    }
  }

  // Validate specific fields
  if (contact.first_name && String(contact.first_name).length > 100) {
    errors.push('first_name must be 100 characters or less');
  }

  if (contact.last_name && String(contact.last_name).length > 100) {
    errors.push('last_name must be 100 characters or less');
  }

  // Email validation
  if (contact.email && !validator.isEmail(contact.email)) {
    errors.push('email must be a valid email address');
  }

  // Phone validation - E.164 format
  if (contact.phone) {
    const phoneStr = String(contact.phone).trim();
    if (!validator.isMobilePhone(phoneStr, 'any', { strictMode: true })) {
      errors.push('phone must be in E.164 format (e.g., +12025551234)');
    }
  }

  // Organization optional but validate if provided
  if (contact.organization && String(contact.organization).length > 100) {
    errors.push('organization must be 100 characters or less');
  }

  // Address validation
  if (contact.address && String(contact.address).length > 200) {
    errors.push('address must be 200 characters or less');
  }

  if (contact.address2 && String(contact.address2).length > 100) {
    errors.push('address2 must be 100 characters or less');
  }

  // City validation
  if (contact.city && String(contact.city).length > 100) {
    errors.push('city must be 100 characters or less');
  }

  // State validation - required for US/CA
  if ((contact.country === 'US' || contact.country === 'CA') && !contact.state) {
    errors.push('state is required for US/CA addresses');
  }

  if (contact.state) {
    const stateStr = String(contact.state).toUpperCase();
    if (contact.country === 'US' && !US_STATES.has(stateStr)) {
      errors.push('state must be a valid US state code');
    } else if (contact.country === 'CA' && !CA_PROVINCES.has(stateStr)) {
      errors.push('state must be a valid Canadian province code');
    }
  }

  // Zip code validation
  if (contact.zip) {
    const zipStr = String(contact.zip).trim();
    if (zipStr.length < 2 || zipStr.length > 20) {
      errors.push('zip code must be 2-20 characters');
    }
  }

  // Country validation
  if (contact.country) {
    const countryStr = String(contact.country).toUpperCase();
    if (!COUNTRY_CODES.has(countryStr)) {
      errors.push('country must be a valid ISO 3166-1 alpha-2 code');
    }
  }

  // Fax validation if provided
  if (contact.fax) {
    const faxStr = String(contact.fax).trim();
    if (faxStr && !validator.isMobilePhone(faxStr, 'any', { strictMode: true })) {
      errors.push('fax must be in E.164 format (e.g., +12025551234)');
    }
  }

  return errors.length > 0 ? errors : null;
}

/**
 * Validate and normalize contact info
 */
function normalizeContactInfo(contact) {
  const normalized = {
    first_name: String(contact.first_name || '').trim(),
    last_name: String(contact.last_name || '').trim(),
    email: String(contact.email || '').trim().toLowerCase(),
    phone: String(contact.phone || '').trim(),
    address: String(contact.address || '').trim(),
    city: String(contact.city || '').trim(),
    zip: String(contact.zip || '').trim(),
    country: String(contact.country || '').toUpperCase().trim()
  };

  // Optional fields
  if (contact.organization) {
    normalized.organization = String(contact.organization).trim();
  }
  if (contact.address2) {
    normalized.address2 = String(contact.address2).trim();
  }
  if (contact.state) {
    normalized.state = String(contact.state).toUpperCase().trim();
  }
  if (contact.fax) {
    normalized.fax = String(contact.fax).trim();
  }

  return normalized;
}

module.exports = {
  validateContactInfo,
  normalizeContactInfo,
  REQUIRED_FIELDS,
  OPTIONAL_FIELDS,
  COUNTRY_CODES,
  US_STATES,
  CA_PROVINCES
};
