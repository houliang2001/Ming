import { preview } from 'vite'
import { createInlineViteConfig } from './vite-inline-config.mjs'

const server = await preview(createInlineViteConfig('production'))
server.printUrls()
