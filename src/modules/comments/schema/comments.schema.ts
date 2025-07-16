import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export class Comment {
    @Prop({ required: true })
    content: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    commentBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
    book: Types.ObjectId;
}

export type CommentDocument =  Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);