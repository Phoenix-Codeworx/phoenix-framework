import { prop, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class User {
  @Field(() => String)
  @prop({ required: true })
  name!: string; // Use definite assignment assertion

  @Field(() => String)
  @prop({ required: true, unique: true })
  email!: string; // Use definite assignment assertion
}

export const UserModel = getModelForClass(User);
