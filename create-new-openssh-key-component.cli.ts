import { runAndExit, createCli, createLeaf } from '@alwaysai/alwayscli';
import { createNewOpensshKeyComponent } from './create-new-openssh-key-component';

const leaf = createLeaf({
  name: createNewOpensshKeyComponent.name,
  async action() {
    return await createNewOpensshKeyComponent({ yes: false });
  },
});

const cli = createCli(leaf);

if (module === require.main) {
  runAndExit(cli, ...process.argv.slice(2));
}
