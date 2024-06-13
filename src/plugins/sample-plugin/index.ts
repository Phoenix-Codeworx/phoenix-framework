import { SampleResolver } from './resolvers/sample-resolver';
import type { Plugin } from '../plugin-interface';
import FunctionRegistry from '../function-registry';

const samplePlugin: Plugin = {
  name: 'Sample Plugin',
  type: 'sample',
  resolvers: [SampleResolver],
  register: (container: any) => {
    // Perform any additional registration if necessary
    const functionRegistry = FunctionRegistry.getInstance();
    functionRegistry.registerFunction('sample', () => console.log('Sample function called'));
  },
};

export default samplePlugin;
