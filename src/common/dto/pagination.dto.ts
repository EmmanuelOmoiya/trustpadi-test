import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class Pagination {
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    @ApiProperty({
        description: 'Page Number',
        example: 1,
        required: false,
        title: 'page',
        default: 1
    })
    page: number;
    
    @IsNumber()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    @IsOptional()
    @ApiProperty({
        description: 'Size of data',
        example: 10,
        required: false,
        title: 'limit',
        default: 10
    })
    limit: number;
}