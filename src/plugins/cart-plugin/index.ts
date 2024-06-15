import { Container } from 'typedi';
import { getModelForClass, prop } from '@typegoose/typegoose';
import { type GlobalContext } from '../global-context';
import { Cart } from './models/cart';
import { CartResolver } from './resolvers/cart-resolver';

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
