import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    first_name: string;

    @Prop({ required: true })
    last_name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
    books: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    followers: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    following: Types.ObjectId[];

    @Prop({ type: String })
    refreshToken: string;
}

export type UserDocument =  User & Document;
export const UserSchema = SchemaFactory.createForClass(User);