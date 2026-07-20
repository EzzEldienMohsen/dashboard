// Vercel Serverless Function entrypoint. Plain CommonJS requiring the
// output of `nest build` (dist/src/**) — never TypeScript source — so
// Nest's DI metadata (emitDecoratorMetadata, compiled by real tsc via
// `nest build`) is never re-processed by Vercel's esbuild-based bundler,
// which does not support emitDecoratorMetadata.
require('../dist/src/instrument'); // Sentry.init() before app.module is loaded

const { createNestApp } = require('../dist/src/bootstrap');

let handlerPromise;

function getHandler() {
  if (!handlerPromise) {
    handlerPromise = createNestApp().then(async (app) => {
      await app.init(); // NOT app.listen() — Vercel manages the HTTP layer
      return app.getHttpAdapter().getInstance(); // the underlying Express app
    });
  }
  return handlerPromise;
}

module.exports = async (req, res) => {
  const expressApp = await getHandler();
  expressApp(req, res);
};
