import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { User } from '../entities/user';
import { UserService } from '../services/user-service';

@Service() // Ensure the service decorator is applied
@Resolver()
export class UserResolver {
  @Inject(() => UserService)
  private readonly userService!: UserService;

  @Query(() => [User])
  async users() {
    return this.userService.getAllUsers();
  }

  @Mutation(() => User)
  async createUser(
    @Arg('name') name: string,
    @Arg('email') email: string
  ) {
    return this.userService.createUser(name, email);
  }
}
