import { Container, Service } from 'typedi';
import { Cart } from '../models/cart';
import { getModelForClass } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { Item } from '../models/cart';

@Service()
export class CartService {
  public async addItemToCart(cartId: string, item: Item): Promise<Cart> {
    const CartModel = Container.get('CartModel') as ReturnType<typeof getModelForClass>;
    const objectId = new Types.ObjectId(cartId);
    const cart = await CartModel.findById(objectId).exec();
    if (cart) {
      cart.items.push(item);
      await cart.save();
    }
    return cart;
  }

  public async getCarts(): Promise<Cart[]> {
    const CartModel = Container.get('CartModel') as ReturnType<typeof getModelForClass>;
    return await CartModel.find().exec();
  }
}
