import { prop, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Sample {
  @Field(() => String)
  @prop({ required: true })
  name!: string;
}

export const SampleModel = getModelForClass(Sample);
