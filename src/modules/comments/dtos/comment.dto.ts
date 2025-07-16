import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty()
    @ApiProperty({
        description: 'Content',
        example: 'It is a lovely book',
        required: true,
        title: 'content'
    })
    @Transform(({ value }) => String(value).toLowerCase().trim())
    content: string;
};