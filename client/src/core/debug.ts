import _ from 'lodash';

const FLAGS = ['forms'] as const;

export const debug: {[K in typeof FLAGS[number]]?: boolean} = {};
export const log: {[K in typeof FLAGS[number]]: (...args) => void} = {} as any;
export default debug;

const debugParam = new URL(window.location.toString()).searchParams.get('debug');
for (const flag of _.split(debugParam, ',')) {
  debug[flag] = true;
}

for (const flag of FLAGS) {
  log[flag] = (...args) => {
    if (debug[flag]) console.log(`${flag}:`, ...args);
  };
}
