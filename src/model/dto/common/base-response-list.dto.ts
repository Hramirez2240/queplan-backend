export interface BaseResponseListDto<T> {
    statusCode: number;
    data: T[];
    message: string;
}