import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AlarmSeverity {
  INFO = 'info',
  WARN = 'warn',
  CRIT = 'crit',
}

export enum AlarmStatus {
  OPEN = 'open',
  ACK = 'ack',
  CLOSED = 'closed',
}

export class AlarmDto {
  @ApiProperty({ description: 'Alarm ID' })
  id: string;

  @ApiProperty({ description: 'Machine ID' })
  machineId: string;

  @ApiProperty({ description: 'Alarm type', example: 'manual' })
  type: string;

  @ApiProperty({
    description: 'Alarm severity',
    enum: AlarmSeverity,
    example: AlarmSeverity.WARN,
  })
  severity: AlarmSeverity;

  @ApiProperty({
    description: 'Alarm status',
    enum: AlarmStatus,
    example: AlarmStatus.OPEN,
  })
  status: AlarmStatus;

  @ApiProperty({ description: 'Alarm title' })
  title: string;

  @ApiProperty({
    additionalProperties: true,
    description: 'Alarm details',
    type: 'object',
    example: {
      metric: 'temperature',
      value: 95,
      limit: 90,
      unit: 'C',
    },
  })
  details: Record<string, any>;

  @ApiProperty({ description: 'When the alarm was opened' })
  openedAt: string;

  @ApiProperty({ description: 'When the alarm was last seen' })
  lastSeenAt: string;

  @ApiPropertyOptional({ description: 'When the alarm was acknowledged' })
  ackAt?: string;

  @ApiPropertyOptional({ description: 'When the alarm was closed' })
  closedAt?: string;

  @ApiPropertyOptional({ description: 'Deduplication key' })
  dedupeKey?: string;
}
