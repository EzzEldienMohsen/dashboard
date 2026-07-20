// Copies swagger-ui-dist's static assets into dist/swagger-ui-assets so
// that SwaggerModule.setup()'s `customSwaggerUiPath` (see src/bootstrap.ts)
// always serves them from inside apps/api/dist — a location that (a) is
// guaranteed to exist under Vercel's Root Directory so vercel.json's
// `includeFiles` glob doesn't need to traverse outside it, and (b) is
// identical across local/Docker/Vercel, so there is exactly one code path
// for how Swagger UI assets are served in every environment.
const fs = require('node:fs');
const path = require('node:path');

// swagger-ui-dist is only a transitive dependency (via @nestjs/swagger), not
// a direct one — pnpm's strict node_modules isolation means a plain
// `require.resolve('swagger-ui-dist/...')` from this script fails, so
// resolve it starting from @nestjs/swagger's own location instead.
const nestSwaggerDir = path.dirname(require.resolve('@nestjs/swagger/package.json'));
const sourceDir = path.dirname(
  require.resolve('swagger-ui-dist/package.json', { paths: [nestSwaggerDir] }),
);
const destDir = path.join(__dirname, '..', 'dist', 'swagger-ui-assets');

fs.rmSync(destDir, { recursive: true, force: true });
fs.mkdirSync(destDir, { recursive: true });
fs.cpSync(sourceDir, destDir, { recursive: true });

console.log(`[copy-swagger-ui-assets] ${sourceDir} -> ${destDir}`);
