export declare enum OrderDirection {
    ASC = "asc",
    DESC = "desc"
}
export declare class PatioQueryDto {
    search?: string;
    limit?: number;
    order?: OrderDirection;
}
