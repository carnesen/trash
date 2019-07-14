import { basename } from 'path';
import { Choice } from 'prompts';
import * as tempy from 'tempy';

import { echo } from '../util/echo';
import {
  listOpensshPrivateKeyFilePaths,
  DOT_SSH_DIR,
} from '../util/read-openssh-private-key-files';
import { prompt } from '../util/prompt';
import { createNewOpensshKeyComponent } from './create-new-openssh-key-component';
import { generatePublicKeyMaterial } from '../util/generate-public-key-material';
import { run } from '../spawner/spawner-base/run';
import { promisify } from 'util';
import { writeFile, createReadStream } from 'fs';
import { checkForPasswordlessSshConnectivityComponent } from './check-for-passwordless-ssh-connectivity-component';

const CREATE_NEW_KEY = '*create new key*';

// The following shell script is from the openSSH utility "ssh-copy-id"
//   * Create the .ssh directory with appropriate permissions if it does not exist
//   * Append \n to authorized_keys if it exists but does not end in \n (?)
//   * Append to authorized_keys from stdin using cat
//   * Reset the security context (type) (extended attributes) of authorized_keys
const SHELL_SCRIPT_FOR_APPENDING_TO_AUTHORIZED_KEYS = `exec sh -c 'cd ; umask 077 ; mkdir -p .ssh && { [ -z "'\`tail -1c .ssh/authorized_keys 2>/dev/null\`'" ] || echo >> .ssh/authorized_keys ; } && cat >> .ssh/authorized_keys || exit 1 ; if type restorecon >/dev/null 2>&1 ; then restorecon -F .ssh .ssh/authorized_keys ; fi'`;

export async function setUpPasswordlessSshComponent(props: { targetHostname: string }) {
  echo('We need to set up your system to enable passwordless ssh.');
  const existingPrivateKeyFilePaths = await listOpensshPrivateKeyFilePaths(DOT_SSH_DIR);
  let privateKeyFilePath: string;
  if (existingPrivateKeyFilePaths.length > 0) {
    const choices: Choice[] = existingPrivateKeyFilePaths.map(filePath => ({
      title: basename(filePath),
      value: filePath,
    }));
    choices.push({ title: CREATE_NEW_KEY, value: CREATE_NEW_KEY });
    const answer = await prompt([
      {
        type: 'select',
        name: 'value',
        message: `Select a key from ~/.ssh or choose "${CREATE_NEW_KEY}" to create a new one`,
        initial: 0,
        choices,
      },
    ]);
    if (answer.value === CREATE_NEW_KEY) {
      privateKeyFilePath = await createNewOpensshKeyComponent({ yes: false });
    } else {
      const found = existingPrivateKeyFilePaths.find(
        filePath => filePath === answer.value,
      );
      if (!found) {
        throw new Error(
          'Expected answer value to be the path of an existing private key file',
        );
      }
      privateKeyFilePath = found;
    }
  } else {
    privateKeyFilePath = await createNewOpensshKeyComponent({ yes: false });
  }
  const publicKeyMaterial = await generatePublicKeyMaterial(privateKeyFilePath);
  const publicKeyFilePath = tempy.file();
  await promisify(writeFile)(publicKeyFilePath, publicKeyMaterial);
  echo(
    `We are about to run a command to copy your public key over to the device. Please enter the ssh password for hostname "${
      props.targetHostname
    }" if/when prompted.`,
  );
  await run({
    exe: 'ssh',
    args: [props.targetHostname, SHELL_SCRIPT_FOR_APPENDING_TO_AUTHORIZED_KEYS],
    input: createReadStream(publicKeyFilePath),
  });
  await checkForPasswordlessSshConnectivityComponent({
    targetHostname: props.targetHostname,
  });
}
