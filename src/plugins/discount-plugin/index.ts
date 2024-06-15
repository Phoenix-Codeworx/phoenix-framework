// discount-plugin.ts
import { Container } from 'typedi';
import { Schema } from 'mongoose';
import { type GlobalContext } from '../global-context';

export default {
  name: 'discount-plugin',
  type: 'ecommerce',
  resolvers: [/* Additional resolvers for discounts */],
  initialize(context: GlobalContext) {
    context.extendModel('Cart', (schema: Schema) => {
      schema.add({
        discount: { type: Number, required: false }
      });
    });
    context.extendResolvers('Cart', [/* Additional resolvers for discounts */]);
  }
};
