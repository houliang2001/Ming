import { createServer } from 'vite'
import { createInlineViteConfig } from './vite-inline-config.mjs'

const server = await createServer(createInlineViteConfig('development'))
await server.listen()
server.printUrls()
