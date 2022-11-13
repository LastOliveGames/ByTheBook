import {resolve} from 'path';
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
        if (!changedPath || matches(changedPath)) transformFile(normalizedPath);
      }
      watcher.add(normalizedPath);
      watcher.on('add', checkTranspile);
      watcher.on('change', checkTranspile);
      watcher.on('ready', checkTranspile);
    }
  };
}
