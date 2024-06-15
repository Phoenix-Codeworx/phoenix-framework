import { Field, Float, Int, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

@ObjectType()
export class Item {
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

@ObjectType()
export class Cart {
  @Field(() => [Item])
  @prop({ type: () => [Item], required: true })
  public items!: Item[];
}
