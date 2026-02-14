import { defineConfig } from '@prisma/prisma-config'

export default defineConfig({
  datasource: {
    adapter: {
      url: process.env.DATABASE_URL!,
    },
  },
})
