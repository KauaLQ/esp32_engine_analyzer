// Alarm types

// Alarm severity
export type AlarmSeverity = 'info' | 'warn' | 'crit';

// Alarm status
export type AlarmStatus = 'open' | 'ack' | 'closed';

// Alarm type
export type AlarmType = 'manual' | 'automatic' | 'threshold';

// Alarm details
export interface AlarmDetails {
  metric?: string;
  value?: number;
  limit?: number;
  unit?: string;
  [key: string]: any;
}

// Alarm base
export interface AlarmBase {
  id: string;
  machineId: string;
  type: AlarmType;
  severity: AlarmSeverity;
  status: AlarmStatus;
  title: string;
  details: AlarmDetails;
  openedAt: string;
  lastSeenAt: string;
  ackAt?: string;
  closedAt?: string;
  dedupeKey?: string;
}

// Alarm list item
export type AlarmListItem = AlarmBase;

// Alarm create request
export interface AlarmCreateRequest {
  machineId: string;
  type: AlarmType;
  severity: AlarmSeverity;
  title: string;
  details: AlarmDetails;
  dedupeKey?: string;
}

// Alarm query params
export interface AlarmQueryParams {
  machineId?: string;
  status?: AlarmStatus;
  severity?: AlarmSeverity;
  from?: string;
  to?: string;
  limit?: number;
}

// Paginated response (reusing from machines.ts)
import type { PaginatedResponse } from './machines';

// Alarm list response
export type AlarmListResponse = PaginatedResponse<AlarmListItem>;
