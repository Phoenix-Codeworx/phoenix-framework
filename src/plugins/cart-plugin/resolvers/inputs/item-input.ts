import { InputType, Field, Int, Float } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

@InputType()
export class ItemInput {
  @Field()
  @prop({ required: true })
  public name!: string;

  @Field()
  @prop({ required: true })
  public description!: string;

  @Field()
  @prop({ required: true })
  public productId!: string;

  @Field(() => Int)
  @prop({ required: true })
  public quantity!: number;

  @Field(() => Float)
  @prop({ required: true })
  public price!: number;

}
