import type { CollectionConfig } from 'payload'

export const Blog: CollectionConfig = {
  slug: 'blog',
  admin: {
    useAsTitle: 'title',
    components: {
      beforeListTable: ["/components/WorkflowTab"]
    }
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'normal',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'in-review' },
        { label: 'Published', value: 'published' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    // Workflow-related fields will be added dynamically by the plugin
    {
      name: 'currentWorkflowStep',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Current workflow step ID',
      },
    },
    {
      name: 'workflowStatus',
      type: 'select',
      defaultValue: 'not-started',
      options: [
        { label: 'Not Started', value: 'not-started' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: {
        readOnly: true,
      },
    },
  ],
}
