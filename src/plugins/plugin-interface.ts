import { type GlobalContext } from './global-context';

export interface Plugin {
  name: string;
  type: string;
  resolvers?: Function[];
  register?: (container: any, context: GlobalContext) => void;
  initialize?: (context: GlobalContext) => void;
}
