import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'The data returned by the query',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Metadata about the response',
    example: {
      total: 150,
      limit: 50,
      hasMore: true,
    },
  })
  meta: {
    total?: number;
    limit?: number;
    hasMore?: boolean;
    [key: string]: any;
  };
}
