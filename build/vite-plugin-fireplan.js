import {resolve} from 'path';
import picomatch from 'picomatch';
import {normalizePath} from 'vite';
import {transformFile} from 'fireplan';


export default function fireplan(path) {
  let normalizedPath;

  return {
    name: 'vite-plugin-fireplan',

    configResolved({root}) {
      normalizedPath = normalizePath(resolve(root, path));
    },

    buildStart() {
      transformFile(normalizedPath);
    },

    configureServer({watcher}) {
      const matches = picomatch(normalizedPath);
      function checkTranspile(changedPath) {
        if (matches(changedPath)) transformFile(normalizedPath);
      }
      watcher.add(normalizedPath);
      watcher.on('add', checkTranspile);
      watcher.on('change', checkTranspile);
    }
  };
}
