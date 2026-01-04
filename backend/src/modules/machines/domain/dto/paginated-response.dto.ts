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
      page: 1,
      limit: 100,
      hasMore: true,
    },
  })
  meta: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    [key: string]: any;
  };
}
