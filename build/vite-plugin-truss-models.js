import recursiveReadDir from 'recursive-readdir';
import {normalizePath} from 'vite';
import {resolve} from 'path';

export default function trussModels() {
  const moduleId = normalizePath(resolve('client/src/core/truss-models.ts'));

  return {
    name: 'truss-models',
    async transform(code, id) {
      if (id !== moduleId) return;
      const paths = await recursiveReadDir('client/src/models');
      paths.sort();
      const importLines = [`import truss from './truss';`];
      const mapLines = [];
      for (let i = 0; i < paths.length; i++) {
        const path = normalizePath(paths[i]);
        importLines.push(`import m${i} from '${path.replace(/^client\/src/, '..')}';`);
        mapLines.push(`  '${path.replace(/^.*?\/models/, '').replace(/\.[^.]+$/, '')}': m${i},`);
      }
      return importLines.join('\n') + '\ntruss.mount({\n' + mapLines.join('\n') + '\n});\n';
    }
  };
}
