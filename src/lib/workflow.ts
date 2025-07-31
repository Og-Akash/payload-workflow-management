import { User } from '@/payload-types';
import { BasePayload } from 'payload'

export function determineWorkflowAction(
  doc: any,
  previousDoc: any,
  operation: string,
  collectionSlug?: string,
): { action: string; stepName: string; comment?: string } | null {
  // For new documents
  if (operation === 'create') {
    return {
      action: 'started',
      stepName: 'Workflow Initiated',
      comment: 'Document created and workflow started',
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
            comment: 'All workflow steps completed successfully',
          }

        case 'rejected':
          return {
            action: 'rejected',
            stepName: getCurrentStepName(doc, previousDoc),
            comment: 'Document rejected during workflow process',
          }

        case 'in-progress':
          // Check if step changed (approval/progression)
          if (doc.currentWorkflowStep !== previousDoc.currentWorkflowStep) {
            return {
              action: 'approved',
              stepName: getCurrentStepName(doc, previousDoc),
              comment: `Advanced from step ${previousDoc.currentWorkflowStep} to ${doc.currentWorkflowStep}`,
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
        comment: `Workflow step progressed from ${previousDoc.currentWorkflowStep || 0} to ${doc.currentWorkflowStep}`,
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
      comment: 'Document content updated',
    }
  }

  return null // No significant workflow action
}

// ✅ Helper function to get current step name
export function getCurrentStepName(doc: any, previousDoc: any): string {
  const currentStep = doc.currentWorkflowStep || previousDoc?.currentWorkflowStep

  if (currentStep) {
    return `Step ${currentStep}`
  }

  return 'Unknown Step'
}

// ✅ Function to detect collection-specific workflow actions
export function getCollectionSpecificAction(
  doc: any,
  previousDoc: any,
  collectionSlug?: string,
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
export function getPostWorkflowAction(
  doc: any,
  previousDoc: any,
): { action: string; stepName: string; comment?: string } | null {
  // Check post status changes
  if (doc.status !== previousDoc.status) {
    switch (doc.status) {
      case 'published':
        return {
          action: 'approved',
          stepName: 'Post Publication',
          comment: `Post status changed from '${previousDoc.status}' to 'published'`,
        }

      case 'rejected':
        return {
          action: 'rejected',
          stepName: 'Post Review',
          comment: `Post rejected - status changed from '${previousDoc.status}' to 'rejected'`,
        }

      case 'in-review':
        return {
          action: 'started',
          stepName: 'Post Review Process',
          comment: `Post submitted for review - status changed to 'in-review'`,
        }

      case 'draft':
        return {
          action: 'commented',
          stepName: 'Post Draft',
          comment: `Post moved back to draft status`,
        }
    }
  }

  // Check priority changes (could trigger workflow escalation)
  if (doc.priority !== previousDoc.priority) {
    if (doc.priority === 'critical') {
      return {
        action: 'escalated',
        stepName: 'Priority Escalation',
        comment: `Post priority escalated to '${doc.priority}'`,
      }
    }
  }

  return null
}

// ✅ Contract-specific workflow action detection
export function getContractWorkflowAction(
  doc: any,
  previousDoc: any,
): { action: string; stepName: string; comment?: string } | null {
  // Check contract status changes
  if (doc.status !== previousDoc.status) {
    switch (doc.status) {
      case 'approved':
        return {
          action: 'approved',
          stepName: 'Contract Approval',
          comment: `Contract approved - status changed from '${previousDoc.status}' to 'approved'`,
        }

      case 'rejected':
        return {
          action: 'rejected',
          stepName: 'Contract Review',
          comment: `Contract rejected - status changed from '${previousDoc.status}' to 'rejected'`,
        }

      case 'legal-review':
        return {
          action: 'started',
          stepName: 'Legal Review Process',
          comment: `Contract sent for legal review`,
        }

      case 'under-review':
        return {
          action: 'started',
          stepName: 'Contract Review Process',
          comment: `Contract submitted for review`,
        }
    }
  }

  // Check amount changes (could trigger different approval levels)
  if (doc.amount !== previousDoc.amount) {
    if (doc.amount > 50000 && previousDoc.amount <= 50000) {
      return {
        action: 'escalated',
        stepName: 'Executive Approval Required',
        comment: `Contract amount increased to $${doc.amount}, requiring executive approval`,
      }
    }
  }

  return null
}

// Helper functions
export async function evaluateWorkflowConditions(
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

export async function checkStepPermission(step: any, user: any, payload: any): Promise<boolean> {
  if (step.assignedTo.type === 'role') {
    return user.role === step.assignedTo.role
  } else if (step.assignedTo.type === 'user') {
    return user.id === step.assignedTo.user
  }
  return false
}

export async function logWorkflowAction(logData: {
  workflowId: number
  documentId: string
  collection: string
  stepId: string
  stepName: string
  action: 'approved' | 'rejected' | 'commented' | 'started' | 'completed' | 'escalated'
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

export async function sendWorkflowNotification(params: {
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