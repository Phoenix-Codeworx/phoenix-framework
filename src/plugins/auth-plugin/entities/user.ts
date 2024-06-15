import { prop, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class User {
  @Field(() => String)
  @prop({ required: true })
  name!: string;

  @Field(() => String)
  @prop({ required: true, unique: true })
  email!: string;

  @Field(() => String)
  @prop({ required: true })
  password!: string;

  @Field(() => String)
  @prop({ required: true, default: 'user' })
  role!: string;
}

export const UserModel = getModelForClass(User);
