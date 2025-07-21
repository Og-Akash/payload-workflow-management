import type { CollectionConfig } from 'payload'

export const WorkflowLogs: CollectionConfig = {
  slug: 'workflowLogs',
  admin: {
    useAsTitle: 'action',
  },
  defaultSort: "-createdAt",
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      return Boolean(user) // Only authenticated users can create logs
    },
    update: () => false, // Immutable - no updates allowed
    delete: ({ req: { user } }) => {
      return user?.role === 'admin' // Only admins can delete (for cleanup)
    },
  },
  timestamps: true,
  fields: [
    {
      name: 'workflowId',
      type: 'relationship',
      relationTo: 'workflows',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'documentId',
      type: 'text',
      required: true,
      admin: {
        description: 'ID of the document this workflow action affected',
        readOnly: true,
      },
    },
    {
      name: 'collection',
      type: 'text',
      required: true,
      admin: {
        description: 'Collection name of the affected document',
        readOnly: true,
      },
    },
    {
      name: 'stepId',
      type: 'text',
      required: true,
      admin: {
        description: 'ID of the workflow step',
        readOnly: true,
      },
    },
    {
      name: 'stepName',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Commented', value: 'commented' },
        { label: 'Started', value: 'started' },
        { label: 'Completed', value: 'completed' },
        { label: 'Escalated', value: 'escalated' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'comment',
      type: 'textarea',
      admin: {
        description: 'Optional comment from the user',
        readOnly: true,
      },
    },
    {
      name: 'previousStepId',
      type: 'text',
      admin: {
        description: 'ID of the previous step (for tracking flow)',
        readOnly: true,
      },
    },
    {
      name: 'nextStepId',
      type: 'text',
      admin: {
        description: 'ID of the next step (for tracking flow)',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data}) => {
        // Ensure logs are immutable after creation
        if (data.id) {
          throw new Error('Workflow logs cannot be modified once created')
        }
        return data
      },
    ],
  },
}
