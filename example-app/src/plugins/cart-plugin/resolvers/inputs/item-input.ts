import { InputType, Field, Int, Float } from 'type-graphql';

@InputType()
export class ItemInput {
  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  productId!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Float)
  price!: number;
}
