import { SampleResolver } from './resolvers/sample-resolver';

const samplePlugin = {
  name: 'Sample Plugin',
  type: 'sample',
  resolvers: [SampleResolver],
  register: (container: any) => {
    // Perform any additional registration if necessary
  },
};

export default samplePlugin;
