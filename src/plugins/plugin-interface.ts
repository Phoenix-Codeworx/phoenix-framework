import { Container } from 'typedi';
import type { GlobalContext } from './global-context.ts';

export interface Plugin {
  name: string;
  type: string;
  resolvers?: Function[];
  register?: (container: typeof Container, context: GlobalContext) => void;
  initialize?: (context: GlobalContext) => void;
}
