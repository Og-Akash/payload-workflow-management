import 'dotenv/config';
import payload from 'payload';
import config from '@/payload.config';

const seed = async (): Promise<void> => {
  await payload.init({config})

  console.log('🌱 Seeding database...')

  try {
    // Create admin user
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'System Admin',
        role: 'admin',
      },
    })

    console.log('✅ Created admin user:', adminUser.email)

    // Create reviewer user
    const reviewerUser = await payload.create({
      collection: 'users',
      data: {
        email: 'reviewer@example.com',
        password: 'reviewer123',
        name: 'Content Reviewer',
        role: 'reviewer',
      },
    })

    console.log('✅ Created reviewer user:', reviewerUser.email)

    // Create manager user
    const managerUser = await payload.create({
      collection: 'users',
      data: {
        email: 'manager@example.com',
        password: 'manager123',
        name: 'Content Manager',
        role: 'manager',
      },
    })

    console.log('✅ Created manager user:', managerUser.email)

    // Create post workflow
    const postWorkflow = await payload.create({
      collection: 'workflows',
      data: {
        name: 'Post Content Approval',
        description: 'Standard approval process for posts',
        targetCollection: 'post',
        isActive: true,
        steps: [
          {
            stepName: 'Initial Review',
            stepType: 'review',
            assignedTo: {
              type: 'role',
              role: 'reviewer',
            },
            conditions: [],
            order: 1,
            slaHours: 24,
          },
          {
            stepName: 'Manager Approval',
            stepType: 'approval',
            assignedTo: {
              type: 'role',
              role: 'manager',
            },
            conditions: [
              {
                field: 'priority',
                operator: 'equals',
                value: 'high',
              },
            ],
            order: 2,
            slaHours: 48,
          },
          {
            stepName: 'Final Sign-off',
            stepType: 'sign-off',
            assignedTo: {
              type: 'role',
              role: 'admin',
            },
            conditions: [
              {
                field: 'priority',
                operator: 'equals',
                value: 'critical',
              },
            ],
            order: 3,
            slaHours: 12,
          },
        ],
      },
    })

    console.log('✅ Created post workflow:', postWorkflow.name)

    // Create Contract workflow
    const contractWorkflow = await payload.create({
      collection: 'workflows',
      data: {
        name: 'Contract Approval Process',
        description: 'Multi-stage approval for contracts based on amount',
        targetCollection: 'contracts',
        isActive: true,
        steps: [
          {
            stepName: 'Initial Review',
            stepType: 'review',
            assignedTo: {
              type: 'role',
              role: 'reviewer',
            },
            conditions: [],
            order: 1,
            slaHours: 48,
          },
          {
            stepName: 'Legal Review',
            stepType: 'approval',
            assignedTo: {
              type: 'role',
              role: 'manager',
            },
            conditions: [
              {
                field: 'amount',
                operator: 'greater_than',
                value: '10000',
              },
            ],
            order: 2,
            slaHours: 72,
          },
          {
            stepName: 'Executive Approval',
            stepType: 'sign-off',
            assignedTo: {
              type: 'role',
              role: 'admin',
            },
            conditions: [
              {
                field: 'amount',
                operator: 'greater_than',
                value: '50000',
              },
            ],
            order: 3,
            slaHours: 24,
          },
        ],
      },
    })

    console.log('✅ Created contract workflow:', contractWorkflow.name)

    // Create sample post post
    const samplepost = await payload.create({
      collection: 'post',
      data: {
        title: 'Getting Started with Our New System',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'This is a sample post post to demonstrate the workflow system.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        priority: 'high',
        status: 'draft',
        author: reviewerUser.id,
      },
    })

    console.log('✅ Created sample post post:', samplepost.title)

    // Create sample contract
    const sampleContract = await payload.create({
      collection: 'contracts',
      data: {
        title: 'Software Development Agreement',
        description: 'Contract for developing a custom web application',
        amount: 25000,
        contractType: 'service',
        status: 'draft',
        assignedTo: managerUser.id,
      },
    })

    console.log('✅ Created sample contract:', sampleContract.title)

    console.log('🎉 Seeding completed successfully!')

    console.log('\n📋 Demo Credentials:')
    console.log('👑 Admin: admin@example.com / admin123')
    console.log('👥 Manager: manager@example.com / manager123')
    console.log('📝 Reviewer: reviewer@example.com / reviewer123')

    process.exit(0);

  } catch (error) {
    console.error('❌ Error during seeding:', error)
  }
}

seed()

export default seed
