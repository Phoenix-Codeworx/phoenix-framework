import 'reflect-metadata';
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
}

// Debugging step: Log metadata for User class
console.log(Reflect.getMetadata('design:type', User.prototype, 'name'));
console.log(Reflect.getMetadata('design:type', User.prototype, 'email'));

export const UserModel = getModelForClass(User);
