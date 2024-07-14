import { Container } from 'typedi';
import { getModelForClass } from '@typegoose/typegoose';
import { type GlobalContext } from '@phoenix-framework/core/src/plugins/global-context';
import { Cart } from './models/cart';
import { CartResolver } from './resolvers/cart-resolver';
import { CartService } from './services';

export default {
  name: 'cart-plugin',
  type: 'cart',
  resolvers: [CartResolver],
  register(container: typeof Container, context: GlobalContext) {
    const CartModel = getModelForClass(Cart);
    context.models['Cart'] = { schema: CartModel.schema, model: CartModel };
    container.set('CartModel', CartModel);

    // Register CartService explicitly
    container.set(CartService, new CartService());

    // Correctly instantiate CartResolver with CartService
    const cartService = container.get(CartService);
    container.set(CartResolver, new CartResolver(cartService));

    context.extendResolvers('Cart', [CartResolver]);
    const resolverMethods = Object.getOwnPropertyNames(CartResolver.prototype).filter(
      (method) => method !== 'constructor',
    );
  },
};
