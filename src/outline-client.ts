import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

const DocumentSchema = z.any();

const CollectionSchema = z.any();

export type Document = any;
export type Collection = any;

export interface OutlineConfig {
  apiKey: string;
  baseUrl: string;
}

export class OutlineClient {
  private api: AxiosInstance;

  constructor(config: OutlineConfig) {
    this.api = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getDocument(id: string): Promise<Document> {
    // Try different possible endpoints
    const endpoints = ['/api/documents.info', '/api/documents/info', '/api/document/info'];

    for (const endpoint of endpoints) {
      try {
        console.error(`Trying get document endpoint: ${this.api.defaults.baseURL}${endpoint}`);
        const response = await this.api.post(endpoint, { id });

        // Debug: log the actual response structure
        console.error('Get document raw response:', JSON.stringify(response.data, null, 2));

        const data = response.data.data || response.data;

        // Temporarily bypass schema validation and return raw data
        console.error('Returning raw document data:', JSON.stringify(data, null, 2));
        return data as Document;
      } catch (error: any) {
        console.error(`Get document endpoint ${endpoint} failed:`, error.response?.status, error.response?.statusText);
        if (error.response?.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
          console.error(`Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        throw error;
      }
    }
    throw new Error('No valid endpoint found for getting document');
  }

  async searchDocuments(query: string, limit: number = 25): Promise<Document[]> {
    const endpoints = ['/api/documents.search', '/api/documents/search', '/api/document/search'];

    for (const endpoint of endpoints) {
      try {
        const response = await this.api.post(endpoint, { query, limit });
        return response.data.data || response.data;
      } catch (error: any) {
        if (error.response?.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
          console.error(`Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        throw error;
      }
    }
    throw new Error('No valid endpoint found for searching documents');
  }

  async listDocuments(collectionId?: string, limit: number = 25): Promise<Document[]> {
    const payload: any = { limit };
    if (collectionId) {
      payload.collection = collectionId;
    }

    const endpoints = ['/api/documents.list', '/api/documents/list', '/api/documents', '/api/document/list'];

    for (const endpoint of endpoints) {
      try {
        console.error(`Trying endpoint: ${this.api.defaults.baseURL}${endpoint}`);
        const response = await this.api.post(endpoint, payload);

        // Debug: log the actual response structure
        console.error('Raw response data:', JSON.stringify(response.data, null, 2));

        const data = response.data.data || response.data;
        if (Array.isArray(data) && data.length > 0) {
          console.error('Sample document structure:', JSON.stringify(data[0], null, 2));
        }

        // Temporarily bypass schema validation and return raw data
        console.error('Returning raw document list:', JSON.stringify(data, null, 2));
        return data as Document[];
      } catch (error: any) {
        console.error(`Endpoint ${endpoint} failed:`, error.response?.status, error.response?.statusText);
        if (error.response?.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
          continue;
        }
        throw error;
      }
    }
    throw new Error('No valid endpoint found for listing documents');
  }

  async createDocument(data: {
    title: string;
    text: string;
    collectionId?: string;
    parentDocumentId?: string;
    publish?: boolean;
  }): Promise<Document> {
    const payload: any = {
      title: data.title,
      text: data.text,
      publish: data.publish || false,
    };

    if (data.collectionId) {
      payload.collection = data.collectionId;
    }
    if (data.parentDocumentId) {
      payload.parentDocumentId = data.parentDocumentId;
    }

    const endpoints = ['/api/documents.create', '/api/documents/create', '/api/documents', '/api/document/create'];

    for (const endpoint of endpoints) {
      try {
        const response = await this.api.post(endpoint, payload);
        return response.data.data || response.data;
      } catch (error: any) {
        if (error.response?.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
          console.error(`Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        throw error;
      }
    }
    throw new Error('No valid endpoint found for creating document');
  }

  async updateDocument(id: string, data: {
    title?: string;
    text?: string;
    publish?: boolean;
  }): Promise<Document> {
    const endpoints = ['/api/documents.update', '/api/documents/update', '/api/document/update'];

    for (const endpoint of endpoints) {
      try {
        const response = await this.api.post(endpoint, { id, ...data });
        return response.data.data || response.data;
      } catch (error: any) {
        if (error.response?.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
          console.error(`Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        throw error;
      }
    }
    throw new Error('No valid endpoint found for updating document');
  }

  async deleteDocument(id: string): Promise<void> {
    const endpoints = ['/api/documents.delete', '/api/documents/delete', '/api/document/delete'];

    for (const endpoint of endpoints) {
      try {
        await this.api.post(endpoint, { id });
        return;
      } catch (error: any) {
        if (error.response?.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
          console.error(`Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        throw error;
      }
    }
    throw new Error('No valid endpoint found for deleting document');
  }

  async getCollections(): Promise<Collection[]> {
    const endpoints = ['/api/collections.list', '/api/collections/list', '/api/collections', '/api/collection/list'];

    for (const endpoint of endpoints) {
      try {
        const response = await this.api.post(endpoint, {});
        return response.data.data || response.data;
      } catch (error: any) {
        if (error.response?.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
          console.error(`Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        throw error;
      }
    }
    throw new Error('No valid endpoint found for listing collections');
  }

  async getCollection(id: string): Promise<Collection> {
    const endpoints = ['/api/collections.info', '/api/collections/info', '/api/collection/info'];

    for (const endpoint of endpoints) {
      try {
        const response = await this.api.post(endpoint, { id });
        return response.data.data || response.data;
      } catch (error: any) {
        if (error.response?.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
          console.error(`Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        throw error;
      }
    }
    throw new Error('No valid endpoint found for getting collection');
  }
} 