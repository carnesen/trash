// This parse logic is lifted from Bitcoin Core
// https://github.com/bitcoin/bitcoin/blob/8d0ec74801f7b185087d1b6dbb82bdd6fbd8dcc5/src/util/strencodings.cpp#L109
// This specific implementation has been lifted from here by that author (carnesen):
// https://github.com/carnesen/bitcoin-rpc-href/blob/27fd29c6e4705c4c370c23eed2453ff7491e1734/src/parse-host.ts#L1

export function parseHost(str: string) {
  let hostname: string = str;
  let port: number | undefined;
  const indexOfLastColon = str.lastIndexOf(':');
  // if a : is found, and it either follows a [...], or no other : is in the string, treat it as port separator
  const hasColon = indexOfLastColon > -1;
  // if there is a colon and str[0]=='[', colon is not 0, so charAt(indexOfLastColon - 1) is safe
  const isBracketed =
    hasColon && str.startsWith('[') && str.charAt(indexOfLastColon - 1) === ']';
  const hasMultipleColons = hasColon && str.lastIndexOf(':', indexOfLastColon - 1) !== -1;
  if (hasColon && (indexOfLastColon === 0 || isBracketed || !hasMultipleColons)) {
    const portStr = str.slice(indexOfLastColon + 1);
    port = Number(portStr);
    if (isNaN(port) || port !== parseInt(portStr, 10)) {
      throw new Error(`Invalid port in host string "${str}"`);
    }
    hostname = str.slice(0, indexOfLastColon);
  }
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    hostname = hostname.slice(1, -1);
  }
  return {
    hostname,
    port,
  };
}
