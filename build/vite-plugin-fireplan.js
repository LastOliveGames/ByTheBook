import {resolve} from 'path';
import colors from 'picocolors';
import picomatch from 'picomatch';
import {normalizePath} from 'vite';
import {transformFile} from 'fireplan';

export default function fireplan(path) {
  return {
    name: 'vite-plugin-fireplan',
    configureServer({watcher, config: {root, logger}}) {
      const normalizedPath = normalizePath(resolve(root, path));
      const matches = picomatch(normalizedPath);
      function checkTranspile(changedPath) {
        if (!changedPath || matches(changedPath)) {
          transformFile(normalizedPath);
          logger.info(
            `${colors.green('schema updated')} ${colors.dim(path)}`,
            {clear: true, timestamp: true});
        }
      }
      watcher.add(normalizedPath);
      watcher.on('add', checkTranspile);
      watcher.on('change', checkTranspile);
      watcher.on('ready', checkTranspile);
    }
  }
}
