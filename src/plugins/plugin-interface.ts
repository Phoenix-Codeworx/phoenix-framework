import { Container } from 'typedi';

export interface Plugin {
  name: string;
  type: string;
  resolvers: Function[];
  register?: (container: Container) => void;
}
