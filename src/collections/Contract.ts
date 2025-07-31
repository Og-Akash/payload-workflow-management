import type { CollectionConfig } from 'payload'


export const Contract: CollectionConfig = {
  slug: 'contracts',
  admin: {
    useAsTitle: 'title',
    components: {
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'workflowTab',
      type: 'ui',
      admin: {
        components: {
          Field: './components/WorkflowTab',  
        },
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'contractType',
      type: 'select',
      required: true,
      options: [
        { label: 'Service Agreement', value: 'service' },
        { label: 'Purchase Order', value: 'purchase' },
        { label: 'NDA', value: 'nda' },
        { label: 'Employment', value: 'employment' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Under Review', value: 'under-review' },
        { label: 'Legal Review', value: 'legal-review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    // Workflow-related fields
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
