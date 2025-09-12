# MCP Servers Configuration Guide

This document provides information about the configured MCP (Model Context Protocol) servers for the Wine Marketplace project.

## Configured MCP Servers

### 1. ✅ PostgreSQL MCP Server
**Status:** Connected  
**Purpose:** Direct database access and querying  
**Configuration:** Connected to Neon PostgreSQL database

**Capabilities:**
- Execute read-only SQL queries
- Inspect database schema
- Analyze data patterns
- Debug database issues

**Example usage:**
- "Show me all wines from Italy in the database"
- "What's the schema of the users table?"
- "Find the most expensive wine in each region"

### 2. ⚠️ GitHub MCP Server  
**Status:** Configured but requires GitHub token  
**Purpose:** Repository management and workflow automation  
**Configuration:** HTTP transport to GitHub API

**Setup required:**
1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Create new token with repo, workflow, and user permissions
2. Replace `your-github-personal-access-token` in `.env` file with your real token

**Capabilities:**
- Browse and query code repositories
- Create and manage issues/PRs
- Analyze commit history
- Monitor GitHub Actions workflows

### 3. ✅ Playwright MCP Server (Web Scraping)
**Status:** Connected  
**Purpose:** Browser automation and web scraping  
**Configuration:** Using Microsoft's official Playwright MCP

**Capabilities:**
- Scrape wine data from external marketplaces
- Monitor competitor pricing
- Automate web interactions
- Take screenshots and analyze web pages

**Example usage:**
- "Scrape wine prices from competitor websites"
- "Take a screenshot of our homepage"
- "Automate user registration testing"

### 4. ✅ File System MCP Server
**Status:** Connected  
**Purpose:** Advanced file system operations  
**Configuration:** Limited to project directory for security

**Capabilities:**
- Read/write files in project directory
- Search files by patterns
- Organize and manage project assets
- Batch file operations

**Example usage:**
- "Find all TypeScript files with 'wine' in the filename"
- "Create a new component file with boilerplate"
- "Organize image assets by wine type"

### 5. ✅ Fetch MCP Server (HTTP/API)
**Status:** Connected  
**Purpose:** HTTP requests and API testing  
**Configuration:** Using @kazuph/mcp-fetch

**Capabilities:**
- Test external APIs (PayPal, Stripe, shipping)
- Validate webhook endpoints
- Monitor API health
- Transform API responses

**Example usage:**
- "Test the PayPal sandbox API connection"
- "Fetch wine data from external wine APIs"
- "Check if our API endpoints are responding correctly"

## Usage Tips

1. **Security:** The GitHub MCP server will only work after you add a valid GitHub token to the `.env` file
2. **File System:** All file operations are restricted to the `/Users/doimo/Desktop/SYW` directory
3. **Database:** PostgreSQL access is read-only for safety
4. **Web Scraping:** Use Playwright responsibly and respect rate limits

## Commands

```bash
# Check status of all MCP servers
claude mcp list

# Remove a server if needed
claude mcp remove <server-name>

# Add additional servers
claude mcp add <name> <command> [args...]
```

## Troubleshooting

- If a server shows as "Failed to connect", check the configuration and restart Claude Code
- For GitHub issues, ensure your token has the correct permissions
- For file system errors, verify the path permissions
- For database connection issues, check the DATABASE_URL in `.env`

## Integration with Wine Marketplace

These MCP servers are particularly useful for:

1. **Database Analysis:** Query wine inventory, user behavior, sales patterns
2. **Competitive Intelligence:** Scrape competitor wine prices and listings  
3. **API Testing:** Validate payment integrations and shipping APIs
4. **Code Management:** Automate repository tasks and file organization
5. **Monitoring:** Check API health and database performance

The combination of these tools creates a powerful development and operational environment for the wine marketplace platform.