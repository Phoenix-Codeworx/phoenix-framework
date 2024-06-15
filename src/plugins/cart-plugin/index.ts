import { Container } from 'typedi';
import { getModelForClass, prop } from '@typegoose/typegoose';
import { type GlobalContext } from '../global-context';

class Cart {
  @prop({ required: true })
  public items!: string[];
}

export default {
  name: 'cart-plugin',
  type: 'ecommerce',
  resolvers: [/* Cart resolvers here */],
  register(container: typeof Container, context: GlobalContext) {
    const CartModel = getModelForClass(Cart);
    context.models['Cart'] = { schema: CartModel.schema, model: CartModel };
  }
};
