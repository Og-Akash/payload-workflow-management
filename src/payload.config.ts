import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

// Import collections
import { Users } from './collections/Users'
import { Workflows } from './collections/Workflows'
import { WorkflowLogs } from './collections/WorkflowLogs'
import { Blog } from './collections/Blog'
import { Contract } from './collections/Contract'

// Import plugins
import { workflowEngine } from './plugins/workflowEngine'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      // global components go here
    },
  },
  collections: [
    Users,
    Workflows,
    WorkflowLogs,
    Blog,
    Contract,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  plugins: [
    workflowEngine({
      collections: ['blog', 'contracts'], // Enable workflows for these collections
    }),
  ],
})
