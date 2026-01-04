export declare class PaginatedResponseDto<T> {
    data: T[];
    meta: {
        total?: number;
        page?: number;
        limit?: number;
        hasMore?: boolean;
        [key: string]: any;
    };
}
