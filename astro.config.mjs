import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import astroExpressiveCode from 'astro-expressive-code';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import icon from "astro-icon";
import react from "@astrojs/react";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import mermaid from './src/plugins/mermaid.mjs';
import rehypeLazyLoadImage from './src/plugins/lazyLoadImage.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://imwsy043.github.io',
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeLazyLoadImage],
    syntaxHighlight: false
  },
  integrations: [mermaid(), astroExpressiveCode({
    // You can use any of the themes bundled with Shiki by name,
    // specify a path to JSON theme file, or pass an instance
    // of the `ExpressiveCodeTheme` class here:
    themes: ['github-light', 'github-dark'],
    useDarkModeMediaQuery: false,
    themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
    shiki: {
      // You can pass additional plugin options here,
      // e.g. to load custom language grammars:
      langs: [
        // import('./some-exported-grammar.mjs'),
        // JSON.parse(fs.readFileSync('./some-json-grammar.json', 'utf-8'))
      ]
    },
    plugins: [pluginCollapsibleSections(), pluginLineNumbers()]
  }), mdx(), sitemap(), icon(), react()],
});
