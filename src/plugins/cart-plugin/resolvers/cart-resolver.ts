import { Service } from 'typedi';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { CartService } from '../services';
import { Cart } from '../models/cart';
import { ItemInput } from './inputs/item-input';
import { Item } from '../models/cart';

@Service()
@Resolver(() => Cart)
export class CartResolver {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  @Query(() => [Cart])
  async getCarts(): Promise<Cart[]> {
    return this.cartService.getCarts();
  }

  @Mutation(() => Cart)
  async addItemToCart(@Arg('cartId') cartId: string, @Arg('item') item: ItemInput): Promise<Cart> {
    const itemEntity: Item = {
      name: item.name,
      description: item.description,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    };
    return this.cartService.addItemToCart(cartId, itemEntity);
  }
}
