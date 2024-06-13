import 'reflect-metadata';
import { prop, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
class User {
  @Field(() => String)
  @prop({ required: true })
  name!: string;

  @Field(() => String)
  @prop({ required: true, unique: true })
  email!: string;
}

console.log('Metadata for name:', Reflect.getMetadata('design:type', User.prototype, 'name'));
console.log('Metadata for email:', Reflect.getMetadata('design:type', User.prototype, 'email'));

const UserModel = getModelForClass(User);
