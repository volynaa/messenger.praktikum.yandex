import { defineConfig } from 'vite';
import { resolve } from 'path';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
};

export default defineConfig(config);
