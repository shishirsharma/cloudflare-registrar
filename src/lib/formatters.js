const Table = require('cli-table3');

/**
 * Format domains for table display
 */
function formatDomainsTable(domains) {
  const table = new Table({
    head: ['Domain', 'Registrant', 'Email', 'Expires'],
    style: { head: [], border: ['cyan'] },
    wordWrap: true,
    colWidths: [30, 25, 30, 20]
  });

  domains.forEach((domain) => {
    const registrant = domain.registrant
      ? `${domain.registrant.first_name} ${domain.registrant.last_name}`
      : 'N/A';
    const email = domain.registrant?.email || 'N/A';
    const expires = domain.expires_on ? domain.expires_on.split('T')[0] : 'N/A';

    table.push([
      domain.name || domain.domain,
      registrant,
      email,
      expires
    ]);
  });

  return table.toString();
}

/**
 * Format JSON for output
 */
function formatJSON(data, pretty = true) {
  if (pretty) {
    return JSON.stringify(data, null, 2);
  }
  return JSON.stringify(data);
}

/**
 * Format contact info for display
 */
function formatContactInfo(contact) {
  if (!contact) {
    return 'No contact information available';
  }

  const lines = [];
  lines.push('Contact Information:');
  lines.push('─'.repeat(40));

  if (contact.first_name || contact.last_name) {
    lines.push(`Name: ${contact.first_name || ''} ${contact.last_name || ''}`.trim());
  }
  if (contact.email) lines.push(`Email: ${contact.email}`);
  if (contact.phone) lines.push(`Phone: ${contact.phone}`);
  if (contact.organization) lines.push(`Organization: ${contact.organization}`);
  if (contact.address) lines.push(`Address: ${contact.address}`);
  if (contact.address2) lines.push(`Address 2: ${contact.address2}`);
  if (contact.city) lines.push(`City: ${contact.city}`);
  if (contact.state) lines.push(`State: ${contact.state}`);
  if (contact.zip) lines.push(`Zip: ${contact.zip}`);
  if (contact.country) lines.push(`Country: ${contact.country}`);
  if (contact.fax) lines.push(`Fax: ${contact.fax}`);

  return lines.join('\n');
}

/**
 * Format update result
 */
function formatUpdateResult(results) {
  const lines = [];
  lines.push('');
  lines.push('Bulk Update Summary:');
  lines.push('─'.repeat(40));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  lines.push(`✓   Successful: ${successful}`);
  lines.push(`✖   Failed: ${failed}`);
  lines.push(`    Total: ${results.length}`);

  if (failed > 0) {
    lines.push('');
    lines.push('Failed domains:');
    results.forEach((result) => {
      if (!result.success) {
        lines.push(`  • ${result.domain}: ${result.error}`);
      }
    });
  }

  return lines.join('\n');
}

/**
 * Format difference between two contact objects
 */
function formatDifference(current, updated) {
  const differences = [];
  const allKeys = new Set([
    ...Object.keys(current || {}),
    ...Object.keys(updated || {})
  ]);

  allKeys.forEach((key) => {
    const currentVal = current?.[key];
    const updatedVal = updated?.[key];

    if (currentVal !== updatedVal) {
      differences.push({
        field: key,
        current: currentVal || 'N/A',
        updated: updatedVal || 'N/A'
      });
    }
  });

  if (differences.length === 0) {
    return 'No changes';
  }

  const lines = [];
  lines.push('Changes to be applied:');
  lines.push('─'.repeat(60));

  differences.forEach((diff) => {
    lines.push(`${diff.field}:`);
    lines.push(`  Current: ${diff.current}`);
    lines.push(`  Updated: ${diff.updated}`);
  });

  return lines.join('\n');
}

/**
 * Format templates table
 */
function formatTemplatesTable(templates) {
  if (templates.length === 0) {
    return 'No templates saved';
  }

  const table = new Table({
    head: ['Template Name', 'Contact Name', 'Email', 'Saved At'],
    style: { head: [], border: ['cyan'] },
    wordWrap: true,
    colWidths: [20, 25, 30, 25]
  });

  templates.forEach((template) => {
    const name = `${template.first_name || ''} ${template.last_name || ''}`.trim();
    const savedAt = template.savedAt ? template.savedAt.split('T')[0] : 'N/A';

    table.push([
      template.name,
      name,
      template.email || 'N/A',
      savedAt
    ]);
  });

  return table.toString();
}

module.exports = {
  formatDomainsTable,
  formatJSON,
  formatContactInfo,
  formatUpdateResult,
  formatDifference,
  formatTemplatesTable
};
