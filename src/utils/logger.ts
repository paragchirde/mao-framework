/**
 * Logger — colored terminal output for scaffold/activate progress.
 */

import chalk from 'chalk';

export const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✔'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.error(chalk.red('✖'), msg),
  file: {
    created: (path: string) => console.log(chalk.green('  +'), chalk.dim(path)),
    updated: (path: string) => console.log(chalk.yellow('  ~'), chalk.dim(path)),
    skipped: (path: string) => console.log(chalk.gray('  ·'), chalk.dim(path)),
    conflict: (path: string) => console.log(chalk.red('  !'), chalk.dim(path)),
  },
};
