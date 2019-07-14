import { join } from 'path';
import { readdir, readFile, stat } from 'fs';
import { promisify } from 'util';

export async function listOpensshPrivateKeyFilePaths(dir: string) {
  let fileNames: string[];
  try {
    fileNames = await promisify(readdir)(dir);
  } catch (exception) {
    if (exception.code !== 'ENOENT') {
      throw exception;
    }
    return [];
  }
  const filePaths = fileNames.map(fileName => join(dir, fileName));
  const maybePrivateKeyFilePaths = await Promise.all(filePaths.map(isPrivateKeyFilePath));
  const privateKeyFilePaths = maybePrivateKeyFilePaths.filter(
    (maybePrivateKeyFilePath): maybePrivateKeyFilePath is string =>
      Boolean(maybePrivateKeyFilePath),
  );
  return privateKeyFilePaths;
}

async function isPrivateKeyFilePath(filePath: string) {
  const stats = await promisify(stat)(filePath);
  if (stats.isFile() && (stats.mode & 0o700) > 0o400 && (stats.mode & 0o077) === 0) {
    const keyMaterial = await promisify(readFile)(filePath, { encoding: 'utf8' });
    if (keyMaterial.startsWith('-----BEGIN OPENSSH PRIVATE KEY-----')) {
      return filePath;
    }
  }

  return false;
}
