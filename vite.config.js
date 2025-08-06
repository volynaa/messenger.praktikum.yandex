import { defineConfig } from 'vite';
import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars'

export default defineConfig({
    server: {
        port: 3000
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname,'index.html')
            }
        }
    },
    css: {
        postcss: './postcss.config.js'
    },
    plugins: [
        handlebars({
            partialDirectory: './src/components',
            compileOptions: {
                strict: true,
                noEscape: true,
            },
        }),
    ],
})
