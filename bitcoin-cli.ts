import { RpcOptions, BitcoinRpc } from './types';
import { promisify } from 'util';
import { execFile } from 'child_process';

type Options = Partial<RpcOptions> & {
  file?: string;
};

// bitcoin-cli [options] <method> [param0 param1 ...]
// bitcoin-cli [options] -named <method> [name0=value0 name1=value1 ...]
export const createBitcoinCliRpc = (options: Options = {}) => {
  const bitcoinCliRpc: BitcoinRpc = async (method, params) => {
    let file = 'bitcoin-cli';
    let optionsArgs: string[] = [];
    if (options.file) {
      file = options.file;
    }
    optionsArgs = Object.entries(options)
      .filter(([key]) => key !== 'file')
      .map(([key, value]) => `-${key}=${value}`);

    // If "params" is not an array, it's an object of "named" params
    let paramsArgs: string[] = [];
    if (params) {
      if (Array.isArray(params)) {
        paramsArgs = params.map(param => JSON.stringify(param));
      } else {
        optionsArgs.push('-named');
        paramsArgs = Object.entries(params).map(
          ([key, value]) => `-${key}=${JSON.stringify(value)}`,
        );
      }
    }

    const args = [...optionsArgs, method, ...paramsArgs];

    let stdout: string;
    try {
      ({ stdout } = await promisify(execFile)('carl', args, {
        encoding: 'utf8',
      }));
    } catch (ex) {
      // TODO: Throw a better error
      debugger;
      throw ex;
    }
    const stdoutAsNumber = Number(stdout);
    if (!isNaN(stdoutAsNumber)) {
      return stdoutAsNumber;
    }
    try {
      return JSON.parse(stdout);
    } catch (ex) {
      return stdout;
    }
  };
  return bitcoinCliRpc;
};
