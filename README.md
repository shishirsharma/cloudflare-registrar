# Cloudflare Domain Registrant Contact CLI Tool

A powerful command-line interface for managing and updating Cloudflare domain registrant contact information across multiple domains.

## Features

✨ **Core Capabilities:**
- 📋 List all domains with current registrant information
- ✏️ Update a single domain's registrant contact (interactive mode)
- 🔄 Bulk update multiple domains at once
- 📝 Save and load contact templates for quick reuse
- 📊 Table and JSON output formats
- 🔐 Secure API token storage
- ⏱️ Rate limiting and auto-retry logic

## Installation

### Prerequisites
- Node.js >= 14.0.0
- npm or yarn
- Cloudflare account with API token

### Install Locally

```bash
cd /home/shishir/src/cloudflare
npm install
npm link
```

The tool will be available as `cloudflare-registrar` in your terminal.

## Quick Start

### 1. Authenticate with Cloudflare

The easiest way to set up your API token:

```bash
cloudflare-registrar login
```

This command will:
- Show you **detailed step-by-step instructions**
- Open the Cloudflare dashboard in your browser
- Guide you through token creation with **specific UI steps**
- Validate your token before saving
- Save it securely

The login command includes a **complete Cloudflare UI walkthrough** with:
- Where to click (buttons, dropdowns)
- What permissions to select
- Where to find your token
- Common issues and solutions

📖 **For detailed instructions, see:** [LOGIN_GUIDE.md](LOGIN_GUIDE.md)

**Alternative (Manual Setup):**
```bash
cloudflare-registrar config init
```

**Verify Configuration:**
```bash
cloudflare-registrar config show
```

### 2. List Your Domains

```bash
cloudflare-registrar list
```

Output example:
```
Domain                     Registrant              Email                      Expires
─────────────────────────────────────────────────────────────────────────────────────
example.com                John Doe                john@example.com           2025-06-15
another.com                Jane Smith              jane@example.com           2026-03-22
```

### 3. Update a Domain

Interactive mode:
```bash
cloudflare-registrar update example.com
```

Using a template:
```bash
cloudflare-registrar update example.com --template personal
```

### 4. Manage Templates

Save a template:
```bash
cloudflare-registrar template save personal
```

List all templates:
```bash
cloudflare-registrar template list
```

Load a template:
```bash
cloudflare-registrar template load personal
```

Delete a template:
```bash
cloudflare-registrar template delete personal
```

## Commands Reference

### login

Authenticate with Cloudflare and manage API token.

```bash
cloudflare-registrar login         # Interactive login with browser support
cloudflare-registrar auth         # Alias for login
```

Features:
- Opens Cloudflare dashboard automatically
- Guides you through token creation
- Validates token before saving
- Securely stores configuration

This is the recommended way to authenticate.

### config

Manage Cloudflare API configuration.

```bash
cloudflare-registrar config init       # Setup API token with verification
cloudflare-registrar config show       # Display current configuration (token redacted)
cloudflare-registrar config reset      # Clear all configuration
```

### list

List all domains with registrant information.

```bash
cloudflare-registrar list              # Table format
cloudflare-registrar list --json       # JSON format
cloudflare-registrar list --filter pattern  # Filter domains
```

**Options:**
- `-j, --json` - Output as JSON
- `-f, --filter <pattern>` - Filter domains by name (regex)

**Examples:**
```bash
cloudflare-registrar list
cloudflare-registrar list --json
cloudflare-registrar list --filter "^prod-"
```

### update

Update a single domain's registrant contact.

```bash
cloudflare-registrar update <domain>
cloudflare-registrar update <domain> --template <name>
cloudflare-registrar update <domain> --interactive
```

**Options:**
- `-t, --template <name>` - Use a saved template
- `-i, --interactive` - Interactive mode with current values prefilled
- `-j, --json` - Output as JSON

**Examples:**
```bash
cloudflare-registrar update example.com
cloudflare-registrar update example.com --template personal
cloudflare-registrar update example.com --interactive
cloudflare-registrar update example.com --template business --json
```

### bulk-update

Bulk update multiple domains' registrant contact.

```bash
cloudflare-registrar bulk-update --domains <file> --template <name>
cloudflare-registrar bulk-update --domains <file> --template <name> --dry-run
```

**Options:**
- `-d, --domains <file>` - File with domain list (plain text or JSON)
- `-t, --template <name>` - Template name (required)
- `--dry-run` - Show what would be changed without applying
- `-j, --json` - Output as JSON

**Domain File Format:**

Plain text (one domain per line):
```
example.com
another.com
third.com
# Comments are supported
```

JSON:
```json
["example.com", "another.com", "third.com"]
```

**Examples:**
```bash
# Interactive selection with dry-run
cloudflare-registrar bulk-update --template personal --dry-run

# From file with template
cloudflare-registrar bulk-update --domains domains.txt --template business

# JSON output
cloudflare-registrar bulk-update --domains domains.json --template personal --json
```

### template

Manage contact templates.

```bash
cloudflare-registrar template save <name>    # Create new template
cloudflare-registrar template list           # List all templates
cloudflare-registrar template load <name>    # Display template
cloudflare-registrar template delete <name>  # Delete template
```

**Examples:**
```bash
cloudflare-registrar template save personal
cloudflare-registrar template list
cloudflare-registrar template load personal
cloudflare-registrar template delete personal
```

## Contact Information Format

Templates and updates require the following information:

**Required Fields:**
- First Name
- Last Name
- Email (valid email address)
- Phone (E.164 format: +1.2025551234)
- Address
- City
- Country (ISO 3166-1 alpha-2 code)
- Postal Code

**Optional Fields:**
- Organization
- Address 2
- State/Province (required for US/CA)
- Fax (E.164 format)

### Country Codes

Supported country codes (ISO 3166-1 alpha-2):
US, GB, CA, AU, NZ, DE, FR, IT, ES, NL, BE, CH, AT, SE, NO, DK, FI, PL, CZ, HU, RO, GR, PT, IE, JP, CN, IN, BR, MX, KR, SG, HK, RU, ZA, AE, and others.

### Phone Format

Phone numbers must be in E.164 format (international format):
- Valid: `+1.2025551234`, `+44.2071838750`, `+81.312345678`
- Invalid: `(202) 555-1234`, `202-555-1234`, `+1 202 555 1234`

## Global Options

Available with all commands:

```bash
cloudflare-registrar --verbose [command]  # Enable debug output
cloudflare-registrar --no-color [command] # Disable colored output
cloudflare-registrar --json [command]     # Output as JSON (where supported)
```

## Configuration

Configuration is stored at `~/.cloudflare/config.json` with restricted permissions (mode 0600).

**Config Structure:**
```json
{
  "apiToken": "Your API token (masked)",
  "accountId": "Your Cloudflare account ID",
  "createdAt": "2025-02-11T10:30:00.000Z",
  "updatedAt": "2025-02-11T10:35:00.000Z"
}
```

Templates are stored at `~/.cloudflare/templates.json`.

## Error Handling

The tool provides helpful error messages for common issues:

### "Not configured. Run: cloudflare-registrar config init"
Your API token is not configured. Run the setup command.

### "Authentication failed"
Your API token is invalid or expired. Run `cloudflare-registrar config init` to update.

### "Rate limited. Retry after X seconds"
The Cloudflare API is rate limiting. The tool automatically retries with exponential backoff.

### "Validation error: field_name"
Invalid input for a specific field. Check the field requirements above.

### "Domain not found"
The domain doesn't exist in your Cloudflare account or you don't have access to it.

## Examples

### Example 0: Authenticate with Cloudflare

```bash
$ cloudflare-registrar login
```

The tool will:
1. Show setup instructions
2. Offer to open your browser to the Cloudflare dashboard
3. Prompt you to paste your API token
4. Validate the token
5. Save your configuration

### Example 1: Create a personal contact template

```bash
$ cloudflare-registrar template save personal
```

The tool will interactively prompt you to enter:
- First Name
- Last Name
- Email
- Phone
- Address
- City
- Country
- Postal Code
- (Optional) Organization, Address 2, State/Province, Fax

### Example 2: Update a single domain

```bash
$ cloudflare-registrar update example.com --template personal
```

The tool will:
1. Load your "personal" template
2. Show the current registrant information
3. Display the changes that will be made
4. Ask for confirmation
5. Apply the update

### Example 3: Bulk update from file with dry-run

```bash
# Create domains.txt
$ cat > domains.txt << EOF
example.com
another.com
third.com
EOF

# Preview the changes
$ cloudflare-registrar bulk-update --domains domains.txt --template personal --dry-run

# Apply the changes
$ cloudflare-registrar bulk-update --domains domains.txt --template personal
```

### Example 4: Filter and list domains

```bash
# List all domains matching a pattern
cloudflare-registrar list --filter "^prod-"

# Output as JSON for processing
cloudflare-registrar list --json | jq '.[] | .name'
```

## Troubleshooting

### I'm getting "Too many requests" errors

The Cloudflare API rate limits requests. The tool automatically retries, but if you're bulk updating many domains, consider:
- Using `--dry-run` first
- Running the bulk update during off-peak hours
- Updating domains in smaller batches

### My API token doesn't have the right permissions

Ensure your API token has these permissions:
1. Account → Account Settings → Read
2. Domain → Registrar → Edit

Create a new token at: https://dash.cloudflare.com/profile/api-tokens

### Templates file got corrupted

You can reset your configuration:
```bash
cloudflare-registrar config reset
rm ~/.cloudflare/templates.json
cloudflare-registrar config init
```

### Phone number validation failing

Phone numbers must be in E.164 format with a dot separator:
- ✓ `+1.2025551234`
- ✗ `+1 202 555 1234`
- ✗ `(202) 555-1234`

The format is: `+{country_code}.{number}`

## Security Notes

- API tokens are stored locally at `~/.cloudflare/config.json` with restricted file permissions (mode 0600)
- Never commit your config file to version control
- The tool will never log your API token
- Always use a token with minimal required permissions

## Support

For issues, feature requests, or questions:
1. Check the troubleshooting section above
2. Review error messages carefully - they often suggest solutions
3. Ensure your API token has the correct permissions
4. Verify your contact information format matches requirements

## License

MIT

## Changelog

### v1.0.1 (2025-02-11)
- Added `login` command for easy authentication
- Browser integration to open Cloudflare dashboard
- Automatic token validation
- Improved onboarding experience

### v1.0.0 (2025-02-11)
- Initial release
- Config management
- Domain listing with filtering
- Single domain updates
- Bulk domain updates
- Contact templates
- Interactive and template-based workflows
- JSON output support
