'use client'
import React from 'react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: '🔄',
    title: 'Dynamic Workflow Engine',
    description:
      'Create unlimited, condition-based approval flows with branching logic, SLA monitoring, and automatic step progression.',
    color: 'blue',
  },
  {
    icon: '👥',
    title: 'Role-Based Assignments',
    description:
      'Assign workflow steps to specific users or roles with granular permission checks and access control.',
    color: 'green',
  },
  {
    icon: '📋',
    title: 'Immutable Audit Trail',
    description:
      'Every action is logged in the WorkflowLogs collection with timestamps, user info, and comments for complete transparency.',
    color: 'purple',
  },
  {
    icon: '⚡',
    title: 'Real-time Actions',
    description:
      'Inline approve/reject/comment buttons injected directly into your documents for seamless workflow management.',
    color: 'orange',
  },
  {
    icon: '🔌',
    title: 'REST API Endpoints',
    description:
      'Built-in REST endpoints for external triggers, status polling, and integration with your existing systems.',
    color: 'red',
  },
  {
    icon: '🎨',
    title: 'Rich Admin UI',
    description:
      'Beautiful, responsive admin interface built with Payload CMS v3 and Next.js 15 for the best user experience.',
    color: 'teal',
  },
]

const Features: React.FC = () => {
  return (
    <section className="features" id="features">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">
            Powerful Features for
            <span className="gradient-text"> Modern Workflows</span>
          </h2>
          <p className="section-description">
            Everything you need to build, manage, and monitor complex approval processes with
            enterprise-grade reliability and user-friendly interfaces.
          </p>
        </motion.div>

        <motion.div
          className="features-grid"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`feature-card feature-${feature.color}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <motion.div
                className="feature-icon"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <span>{feature.icon}</span>
              </motion.div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="features-highlight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="highlight-content">
            <motion.div
              className="highlight-icon"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              🚀
            </motion.div>
            <div className="highlight-text">
              <h3>Built for Scale</h3>
              <p>
                From small teams to enterprise organizations, our workflow system scales with your
                needs. Support for unlimited collections, complex branching logic, and
                high-performance PostgreSQL backend.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
