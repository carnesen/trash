import { TerseError } from '@alwaysai/alwayscli';
import { DOT_SSH_DIR } from '../util/read-openssh-private-key-files';
import { writePrivateKeyFileComponent } from './write-private-key-file-component';
import { join } from 'path';
import { prompt } from '../util/prompt';
import { existsSync } from 'fs';
import { echo } from '../util/echo';

export async function createNewOpensshKeyComponent(opts: {
  yes: boolean;
  privateKeyFileName?: string;
}) {
  let keyFileName: string;
  if (opts.yes) {
    if (!opts.privateKeyFileName) {
      throw new TerseError('"privateKeyFileName" is required with "yes"');
    }
    keyFileName = opts.privateKeyFileName;
  } else {
    const answer = await prompt([
      {
        type: 'text',
        name: 'privateKeyFileName',
        message: 'Enter a name for the ssh key file',
        initial: opts.privateKeyFileName || 'alwaysai.id_rsa',
        validate: value =>
          !existsSync(join(DOT_SSH_DIR, value)) ||
          `File "~/.ssh/${value}" already exists`,
      },
    ]);
    keyFileName = answer.privateKeyFileName;
  }

  const keyFilePath = join(DOT_SSH_DIR, keyFileName);
  await writePrivateKeyFileComponent(keyFilePath);
  echo(`Wrote key file "~/.ssh/${keyFileName}"`);
  return keyFilePath;
}
