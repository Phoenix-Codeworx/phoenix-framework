import { Container } from 'typedi';
import { getModelForClass, prop } from '@typegoose/typegoose';
import { type GlobalContext } from '../global-context';
import { Arg, Mutation, Query, Resolver, Field, ObjectType } from 'type-graphql';
import { Service } from 'typedi';
import { Types } from 'mongoose';

@ObjectType()
class Cart {
  @Field(() => [String])
  @prop({ required: true })
  public items!: string[];

  @Field({ nullable: true })
  @prop()
  public discount?: number;
}

@Service()
@Resolver(() => Cart)
class CartResolver {
  @Query(() => [Cart])
  async getCarts(): Promise<Cart[]> {
    const CartModel = Container.get('CartModel') as ReturnType<typeof getModelForClass>;
    return await CartModel.find().exec();
  }

  @Mutation(() => Cart)
  async addItemToCart(@Arg('cartId') cartId: string, @Arg('item') item: string): Promise<Cart> {
    const CartModel = Container.get('CartModel') as ReturnType<typeof getModelForClass>;
    const objectId = new Types.ObjectId(cartId); // Convert cartId to ObjectId using new keyword
    const cart = await CartModel.findById(objectId).exec();
    if (cart) {
      cart.items.push(item);
      await cart.save();
    }
    return cart;
  }
}

export default {
  name: 'cart-plugin',
  type: 'ecommerce',
  resolvers: [CartResolver],
  register(container: typeof Container, context: GlobalContext) {
    const CartModel = getModelForClass(Cart);
    context.models['Cart'] = { schema: CartModel.schema, model: CartModel };
    container.set('CartModel', CartModel);
    container.set(CartResolver, new CartResolver()); // Register CartResolver explicitly
    context.extendResolvers('Cart', [CartResolver]);

    // Logging the methods of CartResolver
    const resolverMethods = Object.getOwnPropertyNames(CartResolver.prototype).filter(
      (method) => method !== 'constructor',
    );
    console.log('Registered Cart resolvers:', context.resolvers['Cart']);
    console.log('Methods in CartResolver:', resolverMethods);
  },
};
