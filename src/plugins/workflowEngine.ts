import type { Config, Plugin } from 'payload'
import type { CollectionConfig } from 'payload'

interface WorkflowEngineOptions {
  collections?: string[] // Collections to enable workflows for
}

export const workflowEngine = (options: WorkflowEngineOptions = {}): Plugin => {
  return (config: Config): Config => {
    return {
      ...config,
      collections: config.collections?.map((collection) => {
        const collectionConfig = collection as CollectionConfig
        
        // Only add workflow features to specified collections
        if (options.collections?.includes(collectionConfig.slug) || 
            collectionConfig.slug === 'blog' || 
            collectionConfig.slug === 'contracts') {
          
          return {
            ...collectionConfig,
            hooks: {
              ...collectionConfig.hooks,
              beforeChange: [
                ...(collectionConfig.hooks?.beforeChange || []),
                workflowBeforeChangeHook,
              ],
              afterChange: [
                ...(collectionConfig.hooks?.afterChange || []),
                workflowAfterChangeHook,
              ],
            },
            // Add custom admin components for workflow UI
            admin: {
              ...collectionConfig.admin,
              components: {
                ...collectionConfig.admin?.components,
                views: {
                  ...collectionConfig.admin?.components?.views,
                  edit: {
                    ...collectionConfig.admin?.components?.views?.edit,
                    tabs: [
                      ...(collectionConfig.admin?.components?.beforeListTable || []),
                      {
                        label: 'Workflow',
                        path: '/components/WorkflowTab',
                      },
                    ],
                  },
                },
              },
            },
          }
        }
        
        return collectionConfig
      }),
      // Add custom endpoints
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
          handler: getWorkflowStatusHandler,
        },
      ],
    }
  }
}

// Workflow hooks
const workflowBeforeChangeHook = async ({ data, req, operation, originalDoc }) => {
  const { payload, user } = req
  
  console.log(`[Workflow Engine] BeforeChange triggered for ${req.collection?.config?.slug}`)
  
  // Skip if no user or if it's a workflow log (prevent infinite loops)
  if (!user || req.collection?.config?.slug === 'workflowLogs') {
    return data
  }

  try {
    // Find applicable workflows for this collection
    const workflows = await payload.find({
      collection: 'workflows',
      where: {
        and: [
          { targetCollection: { equals: req.collection?.config?.slug } },
          { isActive: { equals: true } },
        ],
      },
    })

    if (workflows.docs.length > 0) {
      const workflow = workflows.docs[0]
      
      // If this is a new document, initialize workflow
      if (operation === 'create') {
        data.workflowStatus = 'in-progress'
        data.currentWorkflowStep = workflow.steps[0]?.order?.toString()
        
        console.log(`[Workflow Engine] Initialized workflow for new document`)
      }
      
      // Evaluate conditions for next steps
      await evaluateWorkflowConditions(data, workflow, payload, user, operation)
    }
  } catch (error) {
    console.error('[Workflow Engine] Error in beforeChange hook:', error)
  }

  return data
}

const workflowAfterChangeHook = async ({ doc, req, operation, previousDoc }) => {
  const { payload, user } = req
  
  // Skip if no user or if it's a workflow log
  if (!user || req.collection?.config?.slug === 'workflowLogs') {
    return doc
  }

  try {
    // Find applicable workflows
    const workflows = await payload.find({
      collection: 'workflows',
      where: {
        and: [
          { targetCollection: { equals: req.collection?.config?.slug } },
          { isActive: { equals: true } },
        ],
      },
    })

    if (workflows.docs.length > 0) {
      const workflow = workflows.docs[0]
      
      // Log workflow action
      await logWorkflowAction({
        workflowId: workflow.id,
        documentId: doc.id,
        collection: req.collection?.config?.slug,
        stepId: doc.currentWorkflowStep || 'initial',
        stepName: 'Document Updated',
        action: operation === 'create' ? 'started' : 'approved',
        user: user.id,
        payload,
      })

      // Send notification (e.g. Console logs)
      await sendWorkflowNotification({
        workflow,
        document: doc,
        action: operation === 'create' ? 'started' : 'updated',
        user,
        payload,
      })
    }
  } catch (error) {
    console.error('[Workflow Engine] Error in afterChange hook:', error)
  }

  return doc
}

// Helper functions
async function evaluateWorkflowConditions(data: any, workflow: any, payload: any, user: any, operation: string) {
  const currentStepOrder = parseInt(data.currentWorkflowStep || '1')
  const currentStep = workflow.steps.find(step => step.order === currentStepOrder)
  
  if (!currentStep) return
  
  // Check if conditions are met
  const conditionsMet = currentStep.conditions?.every(condition => {
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
  if (conditionsMet && await checkStepPermission(currentStep, user, payload)) {
    const nextStep = workflow.steps.find(step => step.order === currentStepOrder + 1)
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
  workflowId: string
  documentId: string
  collection: string
  stepId: string
  stepName: string
  action: string
  user: string
  comment?: string
  payload: any
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
const triggerWorkflowHandler = async (req: any, res: any) => {
  try {
    const { documentId, collection, stepId, action, comment } = req.body
    const { payload, user } = req
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Find the document
    const doc = await payload.findByID({
      collection,
      id: documentId,
    })
    
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    // Find applicable workflow
    const workflows = await payload.find({
      collection: 'workflows',
      where: {
        targetCollection: { equals: collection },
        isActive: { equals: true },
      },
    })
    
    if (workflows.docs.length === 0) {
      return res.status(404).json({ error: 'No active workflow found for this collection' })
    }
    
    const workflow = workflows.docs[0]
    const step = workflow.steps.find(s => s.order.toString() === stepId)
    
    if (!step) {
      return res.status(404).json({ error: 'Workflow step not found' })
    }
    
    // Check permissions
    const hasPermission = await checkStepPermission(step, user, payload)
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions for this workflow step' })
    }
    
    // Process the workflow action
    let updateData: any = {}
    
    if (action === 'approve') {
      const nextStep = workflow.steps.find(s => s.order === step.order + 1)
      if (nextStep) {
        updateData.currentWorkflowStep = nextStep.order.toString()
      } else {
        updateData.workflowStatus = 'completed'
        updateData.currentWorkflowStep = null
      }
    } else if (action === 'reject') {
      updateData.workflowStatus = 'rejected'
      updateData.currentWorkflowStep = null
    }
    
    // Update document
    const updatedDoc = await payload.update({
      collection,
      id: documentId,
      data: updateData,
    })
    
    // Log the action
    await logWorkflowAction({
      workflowId: workflow.id,
      documentId,
      collection,
      stepId,
      stepName: step.stepName,
      action,
      user: user.id,
      comment,
      payload,
    })
    
    res.status(200).json({
      success: true,
      message: `Workflow ${action} completed successfully`,
      document: updatedDoc,
    })
    
  } catch (error) {
    console.error('[Workflow API] Trigger error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getWorkflowStatusHandler = async (req: any, res: any) => {
  try {
    const { docId } = req.params
    const { collection } = req.query
    const { payload, user } = req
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    if (!collection) {
      return res.status(400).json({ error: 'Collection parameter is required' })
    }
    
    // Find the document
    const doc = await payload.findByID({
      collection,
      id: docId,
    })
    
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    // Find applicable workflow
    const workflows = await payload.find({
      collection: 'workflows',
      where: {
        targetCollection: { equals: collection },
        isActive: { equals: true },
      },
    })
    
    if (workflows.docs.length === 0) {
      return res.status(404).json({ error: 'No active workflow found for this collection' })
    }
    
    const workflow = workflows.docs[0]
    
    // Get workflow logs
    const logs = await payload.find({
      collection: 'workflowLogs',
      where: {
        and: [
          { documentId: { equals: docId } },
          { collection: { equals: collection } },
        ],
      },
      sort: '-createdAt',
    })
    
    // Get current step info
    const currentStepOrder = doc.currentWorkflowStep ? parseInt(doc.currentWorkflowStep) : null
    const currentStep = currentStepOrder ? workflow.steps.find(s => s.order === currentStepOrder) : null
    
    res.status(200).json({
      documentId: docId,
      collection,
      workflowStatus: doc.workflowStatus,
      currentStep: currentStep ? {
        id: currentStep.order.toString(),
        name: currentStep.stepName,
        type: currentStep.stepType,
        assignedTo: currentStep.assignedTo,
      } : null,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        steps: workflow.steps.map(step => ({
          id: step.order.toString(),
          name: step.stepName,
          type: step.stepType,
          order: step.order,
          assignedTo: step.assignedTo,
        })),
      },
      logs: logs.docs.map(log => ({
        id: log.id,
        stepName: log.stepName,
        action: log.action,
        user: log.user,
        comment: log.comment,
        createdAt: log.createdAt,
      })),
    })
    
  } catch (error) {
    console.error('[Workflow API] Status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
