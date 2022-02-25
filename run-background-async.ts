import cp = require('child_process');
import signalExit = require('signal-exit');
import { CliTerseError, ICliAnsi, CliAnsi } from '@carnesen/cli';

export type IRunSubprocessOptions = {
	/** A ANSI terminal output decoration object */
	ansi?: ICliAnsi;
	/** Arguments passed to the program invocation */
	args?: string[];
	/** Current working directory from which to spawn the subprocess */
	cwd?: string;
};

/**
 * Spawn a child process, collecting its output in memory until it terminates.
 * @param exe Executable program name e.g. "git"
 * @param options Optional execution configuration e.g. arguments, cwd
 * @throws CliTerseError with a message including the child's interleaved
 * stdout+stderr if it exits non-zero
 * @returns The child's accumulated standard output
 */
export async function runBackgroundAsync(
	exe: string,
	options: IRunSubprocessOptions = {},
): Promise<string> {
	const { ansi = CliAnsi(), args = [], cwd } = options;

	const child = cp.spawn(exe, args, {
		cwd,
	});

	signalExit(() => {
		child.kill();
	});

	const stdoutChunks: Buffer[] = [];
	const allChunks: Buffer[] = [];

	child.stdout.on('data', (chunk) => {
		stdoutChunks.push(chunk);
		allChunks.push(chunk);
	});

	child.stderr.on('data', (chunk) => {
		allChunks.push(chunk);
	});

	return await new Promise((resolve, reject) => {
		child.on('error', (err) => {
			reject(err);
		});

		child.on('close', (code) => {
			if (code === 0) {
				const str = Buffer.concat(stdoutChunks).toString('utf8');
				if (str.endsWith('\n')) {
					resolve(str.slice(0, -1));
				} else {
					resolve(str);
				}
			} else {
				let message = `Process exited with non-zero status code ${ansi.bold(
					String(code),
				)}`;
				message += '\n\n';
				message += `$ ${exe} ${args.join(' ')}`;
				message += '\n\n';
				message += Buffer.concat(allChunks).toString('utf8');
				reject(new CliTerseError(message));
			}
		});
	});
}
