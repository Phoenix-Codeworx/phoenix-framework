import { Service } from 'typedi';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { CartService } from '../services';
import { Cart } from '../models/cart.ts';
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
  async addItemToCart(@Arg('cartId') cartId: string, @Arg('item') item: Item): Promise<Cart> {
    return this.cartService.addItemToCart(cartId, item);
  }
}
