import type { CollectionConfig } from 'payload'

export const Workflows: CollectionConfig = {
  slug: 'workflows',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
    update: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the workflow (e.g., "Blog Approval Process")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed description of this workflow',
      },
    },
    {
      name: 'targetCollection',
      type: 'text',
      required: true,
      admin: {
        description: 'Collection slug this workflow applies to (e.g., "blog", "contracts")',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this workflow is currently active',
      },
    },
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'stepName',
          type: 'text',
          required: true,
          admin: {
            description: 'Name of this step (e.g., "Legal Review")',
          },
        },
        {
          name: 'stepType',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Approval',
              value: 'approval',
            },
            {
              label: 'Review',
              value: 'review',
            },
            {
              label: 'Sign-off',
              value: 'sign-off',
            },
            {
              label: 'Comment Only',
              value: 'comment-only',
            },
          ],
        },
        {
          name: 'assignedTo',
          type: 'group',
          fields: [
            {
              name: 'type',
              type: 'radio',
              required: true,
              options: [
                {
                  label: 'Specific User',
                  value: 'user',
                },
                {
                  label: 'Role',
                  value: 'role',
                },
              ],
            },
            {
              name: 'user',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'user',
              },
            },
            {
              name: 'role',
              type: 'select',
              options: [
                {
                  label: 'Admin',
                  value: 'admin',
                },
                {
                  label: 'Manager',
                  value: 'manager',
                },
                {
                  label: 'Reviewer',
                  value: 'reviewer',
                },
              ],
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'role',
              },
            },
          ],
        },
        {
          name: 'conditions',
          type: 'array',
          admin: {
            description: 'Conditions that must be met for this step to be triggered',
          },
          fields: [
            {
              name: 'field',
              type: 'text',
              required: true,
              admin: {
                description: 'Field name to check (e.g., "amount", "priority")',
              },
            },
            {
              name: 'operator',
              type: 'select',
              required: true,
              options: [
                { label: 'Equals', value: 'equals' },
                { label: 'Not Equals', value: 'not_equals' },
                { label: 'Greater Than', value: 'greater_than' },
                { label: 'Less Than', value: 'less_than' },
                { label: 'Contains', value: 'contains' },
              ],
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: {
                description: 'Value to compare against',
              },
            },
          ],
        },
        {
          name: 'slaHours',
          type: 'number',
          min: 1,
          admin: {
            description: 'SLA in hours for this step (bonus feature)',
          },
        },
        {
          name: 'order',
          type: 'number',
          required: true,
          admin: {
            description: 'Order of execution (1, 2, 3, etc.)',
          },
        },
      ],
    },
  ],
}
