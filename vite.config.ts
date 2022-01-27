import { defineConfig } from 'vite'
import { resolve } from 'path'
import pkg from './package.json'

function getAuthors(pkg) {
  const { contributors, author } = pkg

  const authors = new Set()
  if (contributors) {
    contributors.forEach((contributor) => {
      authors.add(contributor.name)
    })
  }
  if (author) {
    authors.add(author.name)
  }

  return Array.from(authors).join(', ')
}

const banner = `/*!
  * ${pkg.name} v${pkg.version}
  * (c) ${new Date().getFullYear()} ${getAuthors(pkg)}
  * @license ${pkg.license}
  */`

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'modules',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      formats: ['es', 'umd', 'cjs', 'iife'],
      entry: resolve(__dirname, './src/index.ts'),
      name: 'DinoFrame',
    },
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        sourcemap: true,
        banner: banner,
      },
      external: Object.keys(pkg.peerDependencies),
    },
  },
})
