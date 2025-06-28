# Outline MCP Server

A Model Context Protocol (MCP) server for [Outline](https://www.getoutline.com/) that enables reading and writing documents through the Outline API.

## Features

- **Read Documents**: Get individual documents, search, and list documents
- **Write Documents**: Create, update, and delete documents
- **Collection Management**: List and retrieve collection information
- **Full Text Search**: Search across all documents in your Outline instance
- **Markdown Support**: Create and edit documents with full Markdown formatting

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

Before using the server, you need to set up your Outline API credentials:

1. **Get your Outline API token**:

   - Log into your Outline instance (e.g., https://app.getoutline.com)
   - Go to Settings → API Tokens
   - Create a new token

2. **Set environment variables**:
   ```bash
   export OUTLINE_BASE_URL="https://your-outline-instance.com"
   export OUTLINE_API_KEY="your-api-token-here"
   ```

## Usage

### Running the Server

Start the MCP server:

```bash
npm start
```

The server communicates via stdio and is compatible with any MCP client.

### Available Tools

#### Document Operations

1. **outline_get_document**

   - Get a specific document by ID
   - Parameters: `id` (string, required)

2. **outline_search_documents**

   - Search for documents across your Outline instance
   - Parameters: `query` (string, required), `limit` (number, optional, default: 25)

3. **outline_list_documents**

   - List documents, optionally filtered by collection
   - Parameters: `collectionId` (string, optional), `limit` (number, optional, default: 25)

4. **outline_create_document**

   - Create a new document
   - Parameters:
     - `title` (string, required)
     - `text` (string, required) - Markdown content
     - `collectionId` (string, optional)
     - `parentDocumentId` (string, optional)
     - `publish` (boolean, optional, default: false)

5. **outline_update_document**

   - Update an existing document
   - Parameters:
     - `id` (string, required)
     - `title` (string, optional)
     - `text` (string, optional) - Markdown content
     - `publish` (boolean, optional)

6. **outline_delete_document**
   - Delete a document
   - Parameters: `id` (string, required)

#### Collection Operations

7. **outline_list_collections**

   - List all collections in your Outline instance
   - Parameters: none

8. **outline_get_collection**
   - Get information about a specific collection
   - Parameters: `id` (string, required)

### Example Usage

Here are some example tool calls:

```json
{
  "name": "outline_search_documents",
  "arguments": {
    "query": "project documentation",
    "limit": 10
  }
}
```

```json
{
  "name": "outline_create_document",
  "arguments": {
    "title": "New Project Plan",
    "text": "# Project Overview\n\nThis document outlines...",
    "collectionId": "collection-id-here",
    "publish": true
  }
}
```

```json
{
  "name": "outline_update_document",
  "arguments": {
    "id": "document-id-here",
    "title": "Updated Project Plan",
    "text": "# Updated Project Overview\n\nThis document has been updated..."
  }
}
```

## Development

### Project Structure

```
src/
├── index.ts           # Main MCP server implementation
├── outline-client.ts  # Outline API client
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Build and run the server
- `npm run watch` - Watch for changes and rebuild
- `npm start` - Run the compiled server

### Building

```bash
npm run build
```

The compiled JavaScript will be output to the `dist/` directory.

## Configuration with MCP Clients

To use this server with an MCP client, you'll need to configure it to run this server. The exact configuration depends on your client, but generally you'll need to:

1. Specify the command to run: `node /path/to/outline-mcp-server/dist/index.js`
2. Set the environment variables for your Outline instance
3. Configure the client to use stdio transport

### Client Configuration Examples

#### Claude

For clients like Claude that use a JSON configuration file, you can add the following to your `mcp-servers.json`:

```json
{
  "mcpServers": {
    "outline": {
      "command": "node",
      "args": ["/path/to/your/projects/outline-mcp-server/dist/index.js"],
      "env": {
        "OUTLINE_API_KEY": "your-secret-api-token",
        "OUTLINE_BASE_URL": "https://your-outline-instance.com"
      }
    }
  }
}
```

Make sure to replace the `args` path with the absolute path to the `index.js` file in your project, and fill in your actual credentials in the `env` block.

#### Cursor

For clients like Cursor, you can typically set environment variables directly within the client's settings or by launching the client from a terminal where you have already exported the variables.

```bash
export OUTLINE_BASE_URL="https://your-outline-instance.com"
export OUTLINE_API_KEY="your-secret-api-token"

# Then launch Cursor from this terminal
/path/to/Cursor.app/Contents/MacOS/Cursor
```

## API Rate Limits

Be aware that Outline may have API rate limits. The server doesn't implement rate limiting internally, so you may need to handle this at the client level if you're making many requests.

## Error Handling

The server includes comprehensive error handling and will return descriptive error messages for common issues like:

- Missing or invalid API credentials
- Network connectivity problems
- Invalid document IDs
- API rate limit errors

## Security Notes

- Store your API token securely using environment variables
- Never commit your API token to version control
- Consider using restricted API tokens with minimal required permissions
- Be cautious when allowing others to use your MCP server as it has full access to your Outline instance

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
