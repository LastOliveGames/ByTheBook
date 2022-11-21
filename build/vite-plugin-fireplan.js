/* eslint-env node */

import {resolve} from 'path';
import picomatch from 'picomatch';
import colors from 'picocolors';
import {normalizePath} from 'vite';
import {transformFile} from 'fireplan';


export default function fireplan(path) {
  let normalizedPath, tolerant, logger, ws, bufferedError;

  return {
    name: 'vite-plugin-fireplan',

    configResolved(config) {
      normalizedPath = normalizePath(resolve(config.root, path));
      tolerant = config.command === 'serve';
      logger = config.logger;
    },

    buildStart() {
      transform();
    },

    configureServer({watcher, ws: serverWS}) {
      ws = serverWS;
      const matches = picomatch(normalizedPath);
      function checkTranspile(changedPath) {
        if (matches(changedPath)) transform();
      }
      watcher.add(normalizedPath);
      watcher.on('add', checkTranspile);
      watcher.on('change', checkTranspile);
    }
  };

  function transform() {
    try {
      transformFile(normalizedPath);
    } catch (e) {
      if (!tolerant) throw e;
      logger.error(`[fireplan] ${colors.red('Error:')} ${e.message}`);
      sendError(e);
    }
  }

  function sendError(error) {
    if (!(ws && ws.clients.size)) {
      const startPolling = !bufferedError;
      bufferedError = error;
      if (startPolling) poll();
      return;
    }
    bufferedError = null;
    ws.send({
      type: 'error',
      err: {
        message: `[fireplan] Error: ${error.message}`,
        pluginCode: 'vite-plugin-fireplan'
      }
    });
  }

  function poll() {
    if (!bufferedError) return;
    if (ws && ws.clients.size) {
      sendError(bufferedError);
    } else {
      setTimeout(poll, 500);
    }
  }
}
