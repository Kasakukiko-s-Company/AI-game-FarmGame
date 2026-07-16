import { registerHooks } from 'node:module';

/** Resolves Creator-style extensionless relative imports during Node tests. */
export function registerProjectTypeScriptResolver(): void {
  registerHooks({
    resolve(specifier, context, nextResolve) {
      const isRelative = specifier.startsWith('./') || specifier.startsWith('../');
      const lastSegment = specifier.split('/').at(-1) ?? '';
      if (isRelative && !lastSegment.includes('.')) {
        return nextResolve(`${specifier}.ts`, context);
      }
      return nextResolve(specifier, context);
    },
  });
}
