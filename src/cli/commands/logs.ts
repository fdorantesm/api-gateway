import { Command } from 'commander';
import { tailLog } from '../../domain/logs';

export function makeLogsCommand(): Command {
  const cmd = new Command('logs');
  cmd.argument('<node>', 'Node to show logs for');
  cmd.action((node: string) => {
    tailLog(node);
  });
  return cmd;
}
