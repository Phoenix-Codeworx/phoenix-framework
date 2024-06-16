import { Container } from 'typedi';
import { getModelForClass } from '@typegoose/typegoose';
import { type GlobalContext } from '../global-context';
import { Cart } from './models/cart';
import { CartResolver } from './resolvers/cart-resolver';

export default {
  name: 'cart-plugin',
  type: 'cart',
  resolvers: [CartResolver],
  register(container: typeof Container, context: GlobalContext) {
    const CartModel = getModelForClass(Cart);
    context.models['Cart'] = { schema: CartModel.schema, model: CartModel };
    container.set('CartModel', CartModel);
    container.set(CartResolver, new CartResolver()); // Register CartResolver explicitly
    context.extendResolvers('Cart', [CartResolver]);
    const resolverMethods = Object.getOwnPropertyNames(CartResolver.prototype).filter(
      (method) => method !== 'constructor',
    );
  },
};
