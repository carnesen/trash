import { TargetUrl } from './target-url';

const { parse, serialize } = TargetUrl;

const data: ([string, ReturnType<typeof parse>])[] = [
  ['ssh://1/foo', { protocol: 'ssh:', hostname: '1', path: '/foo' }],
  [
    'ssh://localhost:23/foo',
    { protocol: 'ssh:', port: 23, hostname: 'localhost', path: '/foo' },
  ],
  ['ssh://:::23/foo', { protocol: 'ssh:', hostname: '[:::23]', path: '/foo' }],
  [
    'ssh://user@h/foo',
    { protocol: 'ssh:', username: 'user', hostname: 'h', path: '/foo' },
  ],
  [
    'ssh://user:pass@foo/foo',
    {
      protocol: 'ssh:',
      username: 'user',
      password: 'pass',
      hostname: 'foo',
      path: '/foo',
    },
  ],
];

describe('TargetUrl', () => {
  for (const [serialized, targetUrl] of data) {
    it(`parses "${serialized}"`, () => {
      expect(parse(serialized)).toEqual(targetUrl);
    });

    it('idempotency check', () => {
      const serializedAgain = serialize(parse(serialized));
      // This ^^ value may differ from the original "serialized",
      // but if we re-parse and serialize the serializedAgain
      // we would expect to get the same thing back again (idempotency)
      expect(serialize(parse(serializedAgain))).toBe(serializedAgain);
    });
  }

  it('throws "to end with" if the path is "" or "/"', () => {
    expect(() => parse('ssh://foo/')).toThrow(/to end with/i);
    expect(() => parse('ssh://foo')).toThrow(/to end with/i);
  });

  it('throws "to start with" if the protocol is not "ssh:"', () => {
    expect(() => parse('sh://foo')).toThrow(/to start with/i);
  });
});
