import { parseHost } from './parse-host';

export type TargetUrl = {
  protocol: 'ssh:';
  hostname: string;
  path: string;
  port?: number;
  username?: string;
  password?: string;
};

export const TargetUrl = {
  parse,
  serialize,
};

const SSH_COLON_SLASH_SLASH = 'ssh://';

function splitString(str: string, separator: string) {
  const indexOfSeparator = str.indexOf(separator);
  let chunk: string | undefined = undefined;
  let rest = str;
  if (indexOfSeparator > -1) {
    chunk = str.slice(0, indexOfSeparator);
    rest = str.slice(indexOfSeparator + separator.length);
  }
  return [chunk, rest] as [string | undefined, string];
}

function parse(serialized: string) {
  // URL should start with "ssh://"
  // Example: serialized = "ssh://user:pass@[1.2.3.4]:5678/foo/bar"
  const [beforeProtocol, afterProtocol] = splitString(serialized, SSH_COLON_SLASH_SLASH);
  if (beforeProtocol !== '') {
    throw new Error(`Expected target URL to start with "${SSH_COLON_SLASH_SLASH}"`);
  }
  const partial: Partial<TargetUrl> = {
    protocol: 'ssh:',
  };

  // Find the "@" character which indicates the user has provided a username and password
  // Example: afterProtocol = "user:pass@[1.2.3.4]:5678/foo/bar"
  const [beforeAt, afterAt] = splitString(afterProtocol, '@');
  if (beforeAt) {
    // Example: beforeAt = "user:pass"
    const [beforeColon, afterColon] = splitString(beforeAt, ':');
    if (typeof beforeColon !== 'undefined') {
      partial.username = beforeColon;
      partial.password = afterColon;
    } else {
      partial.username = beforeAt;
    }
  }

  // Example: afterAt = [1.2.3.4]:5678/foo/bar;
  const [beforeSlash, afterSlash] = splitString(afterAt, '/');
  if (typeof beforeSlash === 'undefined' || afterSlash.length === 0) {
    throw new Error(
      'Expected URL to end with a filesystem directory "ssh://.../some/path"',
    );
  }

  const { hostname, port } = parseHost(beforeSlash);

  if (!hostname) {
    throw new Error(
      `Expected URL to include a hostname or IP address "ssh://example.com/...`,
    );
  }
  const isIpv6 = hostname.split(':').length > 2;

  if (port) {
    partial.port = port;
  }

  const targetUrl: TargetUrl = {
    protocol: 'ssh:',
    hostname: isIpv6 ? `[${hostname}]` : hostname,
    ...partial,
    path: `/${afterSlash}`,
  };
  return targetUrl;
}

function serialize(targetUrl: TargetUrl) {
  const { protocol, hostname, port, username, password, path: pathname } = targetUrl;
  let serialized = `${protocol}//`;
  let shouldWriteAt = false;
  if (username) {
    serialized += username;
    shouldWriteAt = true;
  }
  if (password) {
    serialized += `:${password}`;
    shouldWriteAt = true;
  }
  if (shouldWriteAt) {
    serialized += '@';
  }
  if (hostname) {
    serialized += hostname;
  }
  if (port) {
    serialized += `:${port}`;
  }
  serialized += pathname;
  return serialized;
}
