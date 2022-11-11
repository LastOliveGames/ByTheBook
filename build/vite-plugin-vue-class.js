import {createFilter} from '@rollup/pluginutils';
import MagicString from 'magic-string';

export default function vueClass(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'vue-class',
    transform(code, id) {
      if (!filter(id) || !id.endsWith('.vue')) return;

      const s = new MagicString(code);
      mangle(code, s);
      const result = {code: s.toString()};
      if (options.sourcemap !== false) result.map = s.generateMap({hires: true});
      return result;
    }
  };
}

function mangle(code, s) {
  if (!/^<script/m.test(code) || !/^<\/script>/m.test(code)) return;
  const classMatch = /^\s*export\s+default\s+class\s+(\w+)(?: extends (\w+))?/m.exec(code);
  if (!classMatch) return;
  const className = classMatch[1];
  let superName = classMatch[2];
  if (className === 'extends') throw new Error('vite-class: your component class must have a name');
  if (superName === 'Vue') superName = undefined;
  if (superName) {
    const regex = `\\bimport\\s+${superName}\\s+from\\s+(['"])(.+?)\\1;`;
    const superImportMatch = code.match(new RegExp(regex));
    if (!superImportMatch) {
      throw new Error(
        `vite-class: unable to find module from which you imported ` +
        `${className}'s superclass ${superName}`);
    }
    s.replace(
      new RegExp(`\\bimport\\s+${superName} `),
      `import {${superName}, default as _vueclass_super} `);
  }
  const defaultExport = superName ?
    `export default _vueclass_defineComponent(${className}, '${className}', _vueclass_super);\n` :
    `export default _vueclass_defineComponent(${className}, '${className}');\n`;
  s.prependLeft(
    classMatch.index,
    `import {defineComponent as _vueclass_defineComponent} from '@/vue-class';\n`);
  s.replace(/^\s*export\s+default\s+class\s+/m, 'export class ');
  s.prependLeft(code.indexOf('\n</script>'), defaultExport);
}
