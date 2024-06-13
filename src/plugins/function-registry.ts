type FunctionType = {
  type: string;
  fn: Function;
};

class FunctionRegistry {
  private static instance: FunctionRegistry;
  private functionsOfType: { [key: string]: FunctionType[] } = {};

  private constructor() {}

  public static getInstance(): FunctionRegistry {
    if (!FunctionRegistry.instance) {
      FunctionRegistry.instance = new FunctionRegistry();
    }
    return FunctionRegistry.instance;
  }

  public registerFunction(type: string, fn: Function) {
    if (!this.functionsOfType[type]) {
      this.functionsOfType[type] = [];
    }
    this.functionsOfType[type].push({ type, fn });
  }

  public getFunctionsOfType(type: string): Function[] {
    return this.functionsOfType[type]?.map((f) => f.fn) || [];
  }
}

export default FunctionRegistry;
