import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export class Book {
    @Prop({ required: true, unique: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User', })
    author: Types.ObjectId;
    
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] })
    comments: Types.ObjectId[];
}

export type BookDocument =  Book & Document;
export const BookSchema = SchemaFactory.createForClass(Book);