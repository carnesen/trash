import { parseHost } from './parse-host';

const data: [string, string, number | undefined][] = [
  ['alwaysai.co', 'alwaysai.co', undefined],
  ['[alwaysai.co]', 'alwaysai.co', undefined],
  ['alwaysai.co:22', 'alwaysai.co', 22],
  ['[alwaysai.co]:22', 'alwaysai.co', 22],
  ['1.2.3.4', '1.2.3.4', undefined],
  ['1.2.3.4:22', '1.2.3.4', 22],
  ['[1.2.3.4]', '1.2.3.4', undefined],
  ['[1.2.3.4]:22', '1.2.3.4', 22],
  ['::ffff:1.2.3.4', '::ffff:1.2.3.4', undefined],
  ['[::ffff:1.2.3.4]:22', '::ffff:1.2.3.4', 22],
  ['[::]:22', '::', 22],
  ['::22', '::22', undefined],
  [':22', '', 22],
  ['[]:22', '', 22],
  ['', '', undefined],
];

describe(parseHost.name, () => {
  for (const [host, hostname, port] of data) {
    it(`parses "${host}"`, () => {
      expect(parseHost(host)).toEqual({
        hostname,
        port,
      });
    });
  }
  it('throws "invalid port in host"', () => {
    expect(() => parseHost('alwaysai.co:')).toThrow(/invalid port in host/i);
  });
});
