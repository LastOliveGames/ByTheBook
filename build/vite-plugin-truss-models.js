import recursiveReadDir from 'recursive-readdir';
import {normalizePath} from 'vite';
import {resolve} from 'path';
import picomatch from 'picomatch';

export default function trussModels() {
  const moduleId = normalizePath(resolve('src/core/truss-models.ts'));
  const matches = picomatch(normalizePath(resolve('src/models')) + '/**');

  return {
    name: 'truss-models',

    configureServer({watcher, moduleGraph, ws}) {
      function checkModel(path) {
        const module = moduleGraph.getModuleById(moduleId);
        if (module && matches(path)) {
          moduleGraph.invalidateModule(module);
          ws.send({type: 'full-reload', path: '*'});
        }
      }
      watcher.on('add', checkModel);
      watcher.on('remove', checkModel);
    },

    async transform(unused, id) {
      if (id !== moduleId) return;
      const paths = await recursiveReadDir('src/models');
      paths.sort();
      const importLines = [`import truss from './truss';`];
      const mapLines = [];
      for (let i = 0; i < paths.length; i++) {
        const path = normalizePath(paths[i]);
        importLines.push(`import m${i} from '${path.replace(/^src/, '..')}';`);
        mapLines.push(`  '${path.replace(/^.*?\/models/, '').replace(/\.[^.]+$/, '')}': m${i},`);
      }
      const code = importLines.join('\n') + '\ntruss.mount({\n' + mapLines.join('\n') + '\n});\n' +
        'export default truss;\n';
      return {code, map: null};
    }
  };
}
