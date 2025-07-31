'use client'
import React from 'react'

const steps = [
  {
    number: '01',
    title: 'Create Document',
    description:
      'Create a new document in any collection (Blog, Contracts, etc.) and the workflow automatically starts.',
    icon: '📝',
    details: 'beforeChange hook sets workflowStatus="in-progress" + step 1 → log started',
  },
  {
    number: '02',
    title: 'Review & Approve',
    description:
      'Assigned users see inline approve/reject buttons directly in the document interface.',
    icon: '✅',
    details:
      'User clicks button → /api/workflows/trigger → permission check → doc update → afterChange logs approved/rejected',
  },
  {
    number: '03',
    title: 'Auto Advance',
    description:
      'System automatically evaluates conditions and moves to the next step or marks as completed.',
    icon: '🔄',
    details:
      'After each update, plugin evaluates step conditions; if met, moves to next step or marks completed',
  },
  {
    number: '04',
    title: 'Audit Trail',
    description:
      'Every action is logged with timestamps, user info, and comments for complete transparency.',
    icon: '📋',
    details:
      'Every transition written to workflowLogs (immutable) & visible in "Activity Log" panel',
  },
]

const HowItWorks: React.FC = () => {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            How It
            <span className="gradient-text"> Works</span>
          </h2>
          <p className="section-description">
            Our workflow system integrates seamlessly into your existing Payload CMS setup. Here's
            how the magic happens in four simple steps.
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <div className="step-details">
                  <code>{step.details}</code>
                </div>
              </div>
              {index < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>

        <div className="workflow-diagram">
          <div className="diagram-title">Workflow Architecture</div>
          <div className="diagram-content">
            <div className="diagram-layer">
              <div className="layer-title">Next.js 15 (App Router)</div>
              <div className="layer-items">
                <span>Public routes</span>
                <span>/api/&lt;collection&gt;/*</span>
                <span>/api/workflows/*</span>
              </div>
            </div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-layer">
              <div className="layer-title">Payload Admin (React)</div>
              <div className="layer-items">
                <span>Custom UI Field</span>
                <span>WorkflowInterface.tsx</span>
                <span>Auth, Media, Rich Text</span>
              </div>
            </div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-layer">
              <div className="layer-title">Payload Core (Node)</div>
              <div className="layer-items">
                <span>Collections: Blog, Contracts</span>
                <span>WorkflowEngine Plugin</span>
                <span>Hooks & Custom endpoints</span>
              </div>
            </div>
            <div className="diagram-arrow">↓</div>
            <div className="diagram-layer">
              <div className="layer-title">PostgreSQL (Drizzle ORM)</div>
              <div className="layer-items">
                <span>users, blog, contracts</span>
                <span>workflows, workflow_logs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
