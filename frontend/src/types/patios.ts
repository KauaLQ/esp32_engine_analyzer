// Patio types

// Patio base
export interface PatioBase {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// Patio public
export interface PatioPublic {
  patioId: string;
  name: string;
  address: string;
}

// Patio create request
export interface PatioCreateRequest {
  name: string;
  address: string;
}

// Patio update request
export interface PatioUpdateRequest {
  name?: string;
  address?: string;
}

// Patio query params
export interface PatioQueryParams {
  search?: string;
  limit?: number;
  order?: 'asc' | 'desc';
}

// Paginated response (reusing from machines.ts)
import type { PaginatedResponse } from './machines';

// Patio list response
export type PatioListResponse = PaginatedResponse<PatioBase>;

// Patio public list response
export type PatioPublicListResponse = PatioPublic[];
