type VerboseDeployerLogger = (message: string, icon?: string) => void;
type VerboseDeployerAction<T extends any[], U> = (
  log: VerboseDeployerLogger,
) => (...args: T) => Promise<U>;
type VerboseDeployerGetInstanceName<T extends any[]> = (...args: T) => string;

const DEFAULT_GET_INSTANCE_NAME: VerboseDeployerGetInstanceName<any[]> = (...args) => {
  switch (typeof args[0]) {
    case 'object': {
      return args[0].name;
    }
    case 'string': {
      return args[0].name;
    }
    default:
      return '';
  }
};

type VerboseDeployerSpecification<T extends any[], U> = {
  className: string;
  Action: VerboseDeployerAction<T, U>;
  getInstanceName?: VerboseDeployerGetInstanceName<T>;
};

export function VerboseDeployer<T extends any[], U>({
  className,
  Action,
  getInstanceName,
}: VerboseDeployerSpecification<T, U>) {
  return async function verboseDeployer(...args: T) {
    depth += 1;
    const instanceName = (getInstanceName || DEFAULT_GET_INSTANCE_NAME)(...args);
    const fullName = `${className}${instanceName ? `:${instanceName}` : ''}`;
    const whitespace = ' '.repeat(2 * depth - 1);
    const log: VerboseDeployerLogger = (message, icon = '·') => {
      const messagePrefix = `${icon}${whitespace}${fullName}`;
      console.error(`${messagePrefix}${message ? ` : ${message}` : ''}`);
    };
    let returnValue: U;
    try {
      log('', '>');
      returnValue = await Action(log)(...args);
      const returnValueAsAny: any = returnValue;
      if (returnValueAsAny && returnValueAsAny.changed === true) {
        log('', logSymbols.warning);
      } else {
        log('', logSymbols.success);
      }
    } catch (ex) {
      log('', logSymbols.error);
      throw ex;
    } finally {
      depth -= 1;
    }
    return returnValue;
  };
}
