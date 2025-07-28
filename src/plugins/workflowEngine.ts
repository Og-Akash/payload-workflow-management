import { Post, User } from '@/payload-types'
import type {
  Config,
  Plugin,
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
  PayloadHandler,
  CollectionSlug,
  PayloadRequest,
  BasePayload,
} from 'payload'

interface WorkflowEngineOptions {
  collections?: string[]
}

export const workflowEngine = (options: WorkflowEngineOptions = {}): Plugin => {
  return (config: Config): Config => {
    return {
      ...config,
      collections: config.collections?.map((collection) => {
        const isTarget =
          options.collections?.includes(collection.slug) ||
          ['post', 'contracts'].includes(collection.slug)
        console.log('isTarget', isTarget)

        if (!isTarget) return collection

        return {
          ...collection,
          hooks: {
            beforeChange: [...(collection.hooks?.beforeChange || []), workflowBeforeChangeHook],
            afterChange: [...(collection.hooks?.afterChange || []), workflowAfterChangeHook],
          },
        }
      }),
      endpoints: [
        ...(config.endpoints || []),
        {
          path: '/workflows/trigger',
          method: 'post',
          handler: triggerWorkflowHandler,
        },
        {
          path: '/workflows/status/:docId',
          method: 'get',
          handler: getWorkflowStatusHandler, // Use separate function
        },
      ],
    }
  }
}

const workflowBeforeChangeHook: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  collection,
}) => {
  const { payload, user } = req

  if (!user || collection?.slug === 'workflowLogs') {
    console.warn(
      '[Workflow Engine] Skipping beforeChange due to missing user or workflowLogs collection.',
    )
    return data
  }

  try {
    const workflows = await payload.find({
      collection: 'workflows',
      where: {
        and: [{ targetCollection: { equals: collection?.slug } }, { isActive: { equals: true } }],
      },
    })

    if (workflows.docs.length === 0) return data

    const workflow = workflows.docs[0]

    if (operation === 'create') {
      data.workflowStatus = 'in-progress'
      data.currentWorkflowStep = workflow.steps?.[0]?.order?.toString() || '1'
    }

    await evaluateWorkflowConditions(data, workflow, payload, user, operation)
  } catch (error) {
    console.error('[Workflow Engine] Error in beforeChange:', error)
  }

  return data
}

const workflowAfterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  previousDoc,
  collection,
}) => {
  const { payload, user } = req

  // Skip workflow logs collection and check user
  if (!user || collection?.slug === 'workflowLogs') {
    console.log(
      `[Workflow Engine] Skipping afterChange for ${collection?.slug}, user: ${user ? 'exists' : 'missing'}`
    )
    return doc
  }

  try {
    console.log(`[Workflow Engine] Processing afterChange for ${collection?.slug}, operation: ${operation}`)
    
    // Find applicable workflows
    const workflows = await payload.find({
      collection: 'workflows',
      where: {
        and: [
          { targetCollection: { equals: collection?.slug } }, 
          { isActive: { equals: true } }
        ],
      },
    })

    if (workflows.docs.length === 0) {
      console.log(`[Workflow Engine] No active workflows found for ${collection?.slug}`)
      return doc
    }

    const workflow = workflows.docs[0]
    console.log(`[Workflow Engine] Found workflow: ${workflow.name}`)

    // ✅ Determine the actual action based on status changes
    const actionData = determineWorkflowAction(doc, previousDoc, operation, collection?.slug)
    
    if (!actionData) {
      console.log('[Workflow Engine] No significant workflow action detected')
      return doc
    }

    console.log(`[Workflow Engine] Detected action: ${actionData.action}`)
    // Create log entry with the detected action
    try {
      await logWorkflowAction({
        workflowId: workflow.id,
        documentId: doc.id.toString(),
        collection: collection?.slug || 'unknown',
        stepId: doc.currentWorkflowStep || 'initial',
        stepName: actionData.stepName,
        action: actionData.action as "approved" | "rejected" | "commented" | "started" | "completed" | "escalated",
        user: user.id,
        comment: actionData.comment,
        payload,
      })

      // Send notification
      await sendWorkflowNotification({
        workflow,
        document: doc,
        action: actionData.action,
        user,
        payload,
      })
      
      console.log(`[Workflow Engine] ✅ Successfully logged ${actionData.action} action for document ${doc.id}`)
      
    } catch (logError) {
      console.error('[Workflow Engine] ❌ Failed to log workflow action:', logError)
    }

  } catch (error) {
    console.error('[Workflow Engine] ❌ Error in afterChange hook:', error)
  }

  return doc
}

// ✅ Function to determine the actual workflow action based on document changes
function determineWorkflowAction(
  doc: any, 
  previousDoc: any, 
  operation: string, 
  collectionSlug?: string
): { action: string; stepName: string; comment?: string } | null {
  
  // For new documents
  if (operation === 'create') {
    return {
      action: 'started',
      stepName: 'Workflow Initiated',
      comment: 'Document created and workflow started'
    }
  }

  // For updates, check what actually changed
  if (operation === 'update' && previousDoc) {
    
    // Check if workflow status changed
    if (doc.workflowStatus !== previousDoc.workflowStatus) {
      
      switch (doc.workflowStatus) {
        case 'completed':
          return {
            action: 'completed',
            stepName: 'Workflow Completed',
            comment: 'All workflow steps completed successfully'
          }
        
        case 'rejected':
          return {
            action: 'rejected',
            stepName: getCurrentStepName(doc, previousDoc),
            comment: 'Document rejected during workflow process'
          }
        
        case 'in-progress':
          // Check if step changed (approval/progression)
          if (doc.currentWorkflowStep !== previousDoc.currentWorkflowStep) {
            return {
              action: 'approved',
              stepName: getCurrentStepName(doc, previousDoc),
              comment: `Advanced from step ${previousDoc.currentWorkflowStep} to ${doc.currentWorkflowStep}`
            }
          }
          break
      }
    }

    // Check if workflow step changed (without status change)
    if (doc.currentWorkflowStep !== previousDoc.currentWorkflowStep) {
      return {
        action: 'approved',
        stepName: getCurrentStepName(doc, previousDoc),
        comment: `Workflow step progressed from ${previousDoc.currentWorkflowStep || 0} to ${doc.currentWorkflowStep}`
      }
    }

    // Check collection-specific status changes
    const collectionAction = getCollectionSpecificAction(doc, previousDoc, collectionSlug)
    if (collectionAction) {
      return collectionAction
    }

    // Generic document update (non-workflow related)
    return {
      action: 'commented',
      stepName: getCurrentStepName(doc, previousDoc) || 'Document Updated',
      comment: 'Document content updated'
    }
  }

  return null // No significant workflow action
}

// ✅ Helper function to get current step name
function getCurrentStepName(doc: any, previousDoc: any): string {
  const currentStep = doc.currentWorkflowStep || previousDoc?.currentWorkflowStep
  
  if (currentStep) {
    return `Step ${currentStep}`
  }
  
  return 'Unknown Step'
}

// ✅ Function to detect collection-specific workflow actions
function getCollectionSpecificAction(
  doc: any, 
  previousDoc: any, 
  collectionSlug?: string
): { action: string; stepName: string; comment?: string } | null {
  
  switch (collectionSlug) {
    case 'post':
      return getPostWorkflowAction(doc, previousDoc)
    
    case 'contracts':
      return getContractWorkflowAction(doc, previousDoc)
    
    default:
      return null
  }
}

// ✅ Post-specific workflow action detection
function getPostWorkflowAction(
  doc: any, 
  previousDoc: any
): { action: string; stepName: string; comment?: string } | null {
  
  // Check post status changes
  if (doc.status !== previousDoc.status) {
    switch (doc.status) {
      case 'published':
        return {
          action: 'approved',
          stepName: 'Post Publication',
          comment: `Post status changed from '${previousDoc.status}' to 'published'`
        }
      
      case 'rejected':
        return {
          action: 'rejected', 
          stepName: 'Post Review',
          comment: `Post rejected - status changed from '${previousDoc.status}' to 'rejected'`
        }
      
      case 'in-review':
        return {
          action: 'started',
          stepName: 'Post Review Process',
          comment: `Post submitted for review - status changed to 'in-review'`
        }
      
      case 'draft':
        return {
          action: 'commented',
          stepName: 'Post Draft',
          comment: `Post moved back to draft status`
        }
    }
  }

  // Check priority changes (could trigger workflow escalation)
  if (doc.priority !== previousDoc.priority) {
    if (doc.priority === 'critical') {
      return {
        action: 'escalated',
        stepName: 'Priority Escalation',
        comment: `Post priority escalated to '${doc.priority}'`
      }
    }
  }

  return null
}

// ✅ Contract-specific workflow action detection  
function getContractWorkflowAction(
  doc: any, 
  previousDoc: any
): { action: string; stepName: string; comment?: string } | null {
  
  // Check contract status changes
  if (doc.status !== previousDoc.status) {
    switch (doc.status) {
      case 'approved':
        return {
          action: 'approved',
          stepName: 'Contract Approval',
          comment: `Contract approved - status changed from '${previousDoc.status}' to 'approved'`
        }
      
      case 'rejected':
        return {
          action: 'rejected',
          stepName: 'Contract Review',
          comment: `Contract rejected - status changed from '${previousDoc.status}' to 'rejected'`
        }
      
      case 'legal-review':
        return {
          action: 'started',
          stepName: 'Legal Review Process',
          comment: `Contract sent for legal review`
        }
      
      case 'under-review':
        return {
          action: 'started',
          stepName: 'Contract Review Process',
          comment: `Contract submitted for review`
        }
    }
  }

  // Check amount changes (could trigger different approval levels)
  if (doc.amount !== previousDoc.amount) {
    if (doc.amount > 50000 && previousDoc.amount <= 50000) {
      return {
        action: 'escalated',
        stepName: 'Executive Approval Required',
        comment: `Contract amount increased to $${doc.amount}, requiring executive approval`
      }
    }
  }

  return null
}

// Helper functions
async function evaluateWorkflowConditions(
  data: any,
  workflow: any,
  payload: any,
  user: any,
  operation: string,
) {
  const currentStepOrder = parseInt(data.currentWorkflowStep || '1')
  const currentStep = workflow.steps.find((step: any) => step.order === currentStepOrder)

  if (!currentStep) return

  // Check if conditions are met
  const conditionsMet =
    currentStep.conditions?.every((condition: any) => {
      const fieldValue = data[condition.field]

      switch (condition.operator) {
        case 'equals':
          return fieldValue == condition.value
        case 'not_equals':
          return fieldValue != condition.value
        case 'greater_than':
          return parseFloat(fieldValue) > parseFloat(condition.value)
        case 'less_than':
          return parseFloat(fieldValue) < parseFloat(condition.value)
        case 'contains':
          return String(fieldValue).includes(condition.value)
        default:
          return true
      }
    }) ?? true

  console.log(`[Workflow Engine] Conditions met: ${conditionsMet} for step ${currentStepOrder}`)

  // If conditions are met and user has permission, advance to next step
  if (conditionsMet && (await checkStepPermission(currentStep, user, payload))) {
    const nextStep = workflow.steps.find((step: any) => step.order === currentStepOrder + 1)
    if (nextStep) {
      data.currentWorkflowStep = nextStep.order.toString()
      console.log(`[Workflow Engine] Advanced to step ${nextStep.order}: ${nextStep.stepName}`)
    } else {
      data.workflowStatus = 'completed'
      data.currentWorkflowStep = null
      console.log('[Workflow Engine] Workflow completed')
    }
  }
}

async function checkStepPermission(step: any, user: any, payload: any): Promise<boolean> {
  if (step.assignedTo.type === 'role') {
    return user.role === step.assignedTo.role
  } else if (step.assignedTo.type === 'user') {
    return user.id === step.assignedTo.user
  }
  return false
}

async function logWorkflowAction(logData: {
  workflowId: number
  documentId: string
  collection: string
  stepId: string
  stepName: string
  action: "approved" | "rejected" | "commented" | "started" | "completed" | "escalated"
  user: number | User
  comment?: string
  payload: BasePayload
}) {
  try {
    await logData.payload.create({
      collection: 'workflowLogs',
      data: {
        workflowId: logData.workflowId,
        documentId: logData.documentId,
        collection: logData.collection,
        stepId: logData.stepId,
        stepName: logData.stepName,
        action: logData.action,
        user: logData.user,
        comment: logData.comment,
      },
    })
    console.log('[Workflow Engine] Logged workflow action:', logData.action)
  } catch (error) {
    console.error('[Workflow Engine] Failed to log workflow action:', error)
  }
}

async function sendWorkflowNotification(params: {
  workflow: any
  document: any
  action: string
  user: any
  payload: any
}) {
  // Simulated email notification (as per requirements)
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                            WORKFLOW NOTIFICATION                                     ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║ Workflow: ${params.workflow.name.padEnd(65)} ║
║ Document: ${params.document.title?.padEnd(65) || params.document.id.padEnd(65)} ║
║ Action: ${params.action.toUpperCase().padEnd(67)} ║
║ User: ${params.user.name?.padEnd(69) || params.user.email?.padEnd(69)} ║
║ Time: ${new Date().toISOString().padEnd(67)} ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
  `)
}

// Custom API endpoints

const triggerWorkflowHandler: PayloadHandler = async (req) => {
  const { user, payload } = req

  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  if (typeof req.json !== 'function') {
    return new Response(JSON.stringify({ error: 'Request body parser not available' }), { status: 400 })
  }
  const { documentId, collection, stepId, action, comment } = await req.json()

  console.log('handler req object:', { documentId, collection, stepId, action, comment })

  // Find the document
  const doc = await payload.findByID({ collection, id: documentId })
  if (!doc) {
    return new Response(JSON.stringify({ error: 'Document not found' }), { status: 404 })
  }

  // Find the workflow
  const workflows = await payload.find({
    collection: 'workflows',
    where: {
      and: [{ targetCollection: { equals: collection } }, { isActive: { equals: true } }],
    },
  })

  if (workflows.docs.length === 0) {
    return new Response(JSON.stringify({ error: 'Workflow not found' }), { status: 404 })
  }

  const workflow = workflows.docs[0]
  const step = workflow.steps?.find((s: any) => s.order.toString() === stepId)

  if (!step) {
    return new Response(JSON.stringify({ error: 'Step not found' }), { status: 404 })
  }

  const hasPermission = await checkStepPermission(step, user, payload)
  if (!hasPermission) {
    return new Response(JSON.stringify({ error: 'Unauthorized for this step' }), { status: 403 })
  }

  const updateData: any = {}

  if (action === 'approve') {
    const nextStep = workflow.steps?.find((s: any) => s.order === step.order + 1)
    updateData.currentWorkflowStep = nextStep ? nextStep.order.toString() : null
    updateData.workflowStatus = nextStep ? 'in-progress' : 'completed'
  } else if (action === 'reject') {
    updateData.workflowStatus = 'rejected'
    updateData.currentWorkflowStep = null
  }

  const updatedDoc = await payload.update({ collection, id: documentId, data: updateData })

  await logWorkflowAction({
    workflowId: workflow.id,
    documentId,
    collection: documentId.toString(),
    stepId,
    stepName: step.stepName,
    action,
    user: user.id,
    comment,
    payload,
  })

  return new Response(
    JSON.stringify({
      success: true,
      message: `Workflow ${action} processed successfully`,
      document: updatedDoc,
    }),
    { status: 200 },
  )
}

export const getWorkflowStatusHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    // ✅ Use routeParams instead of params
    const routeParams = await req.routeParams

    const { docId, collection } = routeParams as { docId: string; collection: CollectionSlug }

    console.log('[Workflow API] Status request params:', { collection, docId })

    const { payload, user } = req

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test document lookup
    try {
      const doc = await payload.findByID({
        collection: collection as CollectionSlug,
        id: docId,
      }) as Post

      return Response.json(
        {
          success: true,
          docId,
          collection,
          document: {
            id: doc.id,
            title: doc.title || 'No title',
            workflowStatus: doc.workflowStatus || 'not-started',
            currentWorkflowStep: doc.currentWorkflowStep || null,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 },
      )
    } catch (docError) {
      console.error('[Workflow API] Document not found:', docError)
      return Response.json(
        {
          success: false,
          error: 'Document not found',
          docId,
          collection,
        },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error('[Workflow API] Status error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
