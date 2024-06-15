import { Schema } from 'mongoose';
import { type GlobalContext } from '../global-context';
import logger from '../../config/logger';

export default {
  name: 'discount-plugin',
  type: 'ecommerce',
  initialize(context: GlobalContext) {
    context.extendModel('Cart', (schema: Schema) => {
      schema.add({
        discount: { type: Number, required: false }
      });
      logger.info('Extended Cart model with discount');
    });

    console.log('Resolvers before wrapping:', context.resolvers['Cart']);

    context.wrapResolver('Cart', 'addItemToCart', (originalResolver: Function) =>
      async (parent: any, args: any, ctx: any, info: any) => {
        const result = await originalResolver(parent, args, ctx, info);
        if (result) {
          // Apply discount logic
          result.discount = calculateDiscount(result);
        }
        return result;
      }
    );
    logger.info('Wrapped addItemToCart resolver');
  }
};

function calculateDiscount(cart: any): number {
  // Dummy implementation of discount calculation
  return cart.items.length * 0.1;
}
