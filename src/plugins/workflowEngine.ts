import { getWorkflowStatusHandler, triggerWorkflowHandler } from '@/lib/api'
import {
  determineWorkflowAction,
  evaluateWorkflowConditions,
  logWorkflowAction,
  sendWorkflowNotification,
} from '@/lib/workflow'
import type {
  Config,
  Plugin,
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
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
      `[Workflow Engine] Skipping afterChange for ${collection?.slug}, user: ${user ? 'exists' : 'missing'}`,
    )
    return doc
  }

  try {
    console.log(
      `[Workflow Engine] Processing afterChange for ${collection?.slug}, operation: ${operation}`,
    )

    // Find applicable workflows
    const workflows = await payload.find({
      collection: 'workflows',
      where: {
        and: [{ targetCollection: { equals: collection?.slug } }, { isActive: { equals: true } }],
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
        action: actionData.action as
          | 'approved'
          | 'rejected'
          | 'commented'
          | 'started'
          | 'completed'
          | 'escalated',
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

      console.log(
        `[Workflow Engine] ✅ Successfully logged ${actionData.action} action for document ${doc.id}`,
      )
    } catch (logError) {
      console.error('[Workflow Engine] ❌ Failed to log workflow action:', logError)
    }
  } catch (error) {
    console.error('[Workflow Engine] ❌ Error in afterChange hook:', error)
  }

  return doc
}
