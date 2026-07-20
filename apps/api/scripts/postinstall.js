// Runs `prisma generate` after install — but the `prod-deps` stage of
// apps/api/Dockerfile installs with `--prod`, which excludes the `prisma`
// CLI (a devDependency). That stage doesn't need the generated client
// anyway (it's copied in separately from the `build` stage), so skip
// quietly when the CLI isn't installed instead of failing the whole
// `pnpm install`.
try {
  require.resolve('prisma/package.json');
} catch {
  process.exit(0);
}

require('child_process').execSync('prisma generate', { stdio: 'inherit' });
