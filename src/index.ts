#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { OutlineClient, OutlineConfig } from './outline-client.js';

const TOOLS: Tool[] = [
  {
    name: 'outline_get_document',
    description: 'Get a specific document from Outline by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the document to retrieve',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'outline_search_documents',
    description: 'Search for documents in Outline',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find documents',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 25)',
          default: 25,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'outline_list_documents',
    description: 'List documents from Outline, optionally filtered by collection',
    inputSchema: {
      type: 'object',
      properties: {
        collectionId: {
          type: 'string',
          description: 'Optional collection ID to filter documents',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 25)',
          default: 25,
        },
      },
      required: [],
    },
  },
  {
    name: 'outline_create_document',
    description: 'Create a new document in Outline',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the document',
        },
        text: {
          type: 'string',
          description: 'The content of the document in Markdown format',
        },
        collectionId: {
          type: 'string',
          description: 'Optional collection ID to create the document in',
        },
        parentDocumentId: {
          type: 'string',
          description: 'Optional parent document ID for nested documents',
        },
        publish: {
          type: 'boolean',
          description: 'Whether to publish the document immediately (default: false)',
          default: false,
        },
      },
      required: ['title', 'text'],
    },
  },
  {
    name: 'outline_update_document',
    description: 'Update an existing document in Outline',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the document to update',
        },
        title: {
          type: 'string',
          description: 'New title for the document',
        },
        text: {
          type: 'string',
          description: 'New content for the document in Markdown format',
        },
        publish: {
          type: 'boolean',
          description: 'Whether to publish the document',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'outline_delete_document',
    description: 'Delete a document from Outline',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the document to delete',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'outline_list_collections',
    description: 'List all collections in Outline',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'outline_get_collection',
    description: 'Get information about a specific collection',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the collection to retrieve',
        },
      },
      required: ['id'],
    },
  },
];

class OutlineMCPServer {
  private server: Server;
  private outlineClient: OutlineClient | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'outline-mcp-server',
        version: '1.0.0',
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: TOOLS };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.outlineClient) {
        throw new Error('Outline client not configured. Please set OUTLINE_BASE_URL and OUTLINE_API_KEY environment variables.');
      }

      const { name, arguments: args } = request.params;

      if (!args) {
        throw new Error('Missing arguments');
      }

      try {
        switch (name) {
          case 'outline_get_document':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.outlineClient.getDocument(args.id as string),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'outline_search_documents':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.outlineClient.searchDocuments(args.query as string, args.limit as number),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'outline_list_documents':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.outlineClient.listDocuments(args.collectionId as string, args.limit as number),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'outline_create_document':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.outlineClient.createDocument({
                      title: args.title as string,
                      text: args.text as string,
                      collectionId: args.collectionId as string,
                      parentDocumentId: args.parentDocumentId as string,
                      publish: args.publish as boolean,
                    }),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'outline_update_document':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.outlineClient.updateDocument(args.id as string, {
                      title: args.title as string,
                      text: args.text as string,
                      publish: args.publish as boolean,
                    }),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'outline_delete_document':
            await this.outlineClient.deleteDocument(args.id as string);
            return {
              content: [
                {
                  type: 'text',
                  text: `Document ${args.id} deleted successfully`,
                },
              ],
            };

          case 'outline_list_collections':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.outlineClient.getCollections(),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'outline_get_collection':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.outlineClient.getCollection(args.id as string),
                    null,
                    2
                  ),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private initializeOutlineClient() {
    const apiKey = process.env.OUTLINE_API_KEY;
    const baseUrl = process.env.OUTLINE_BASE_URL;

    if (!apiKey || !baseUrl) {
      console.error('Missing required environment variables:');
      if (!baseUrl) {
        console.error('- OUTLINE_BASE_URL: The base URL of your Outline instance');
      }
      if (!apiKey) {
        console.error('- OUTLINE_API_KEY: Your Outline API token');
      }
      process.exit(1);
    }

    this.outlineClient = new OutlineClient({ apiKey, baseUrl });
  }

  async run() {
    this.initializeOutlineClient();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('Outline MCP Server running on stdio');
  }
}

const server = new OutlineMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
}); 