'use client'
import Link from 'next/link'
import React from 'react'
import { motion } from 'framer-motion'

interface HeroProps {
  user: any
  adminUrl: string
}

const Hero: React.FC<HeroProps> = ({ user, adminUrl }) => {
  return (
    <section className="hero">
      <div className="hero-container">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="badge-icon">🚀</span>
            <span>Dynamic Workflow Management System</span>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Streamline Your
            <span className="gradient-text"> Approval Processes </span>
            with Intelligent Workflows
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            A complete, self-hosted workflow orchestration layer built with Payload CMS v3 + Next.js
            15. Attach unlimited, condition-based approval flows to any collection while maintaining
            an immutable audit trail and rich admin UI for real-time actions.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {user ? (
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Link target="_blank" href={adminUrl} className="btn btn-primary">
                  <span>Go to Admin Panel</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Link href={adminUrl} className="btn btn-primary">
                  <span>Get Started</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            )}
            <motion.a
              href="#demo"
              className="btn btn-secondary"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <span>View Demo</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.a>
          </motion.div>

          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {[
              { number: '∞', label: 'Unlimited Workflows' },
              { number: '100%', label: 'Audit Trail' },
              { number: '⚡', label: 'Real-time Actions' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="stat"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1, type: 'spring' }}
              >
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="workflow-preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="workflow-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="workflow-title">Contract Approval Workflow</div>
              <motion.div
                className="workflow-status in-progress"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8, type: 'spring' }}
              >
                In Progress
              </motion.div>
            </motion.div>
            <motion.div
              className="workflow-steps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {[
                { icon: '✅', name: 'Initial Review', time: '2 hours ago', status: 'completed' },
                {
                  icon: '⏳',
                  name: 'Legal Review',
                  assignee: 'Assigned to Legal Team',
                  status: 'active',
                },
                { icon: '⏸️', name: 'Executive Approval', assignee: 'Pending', status: 'pending' },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className={`step ${step.status}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }}
                >
                  <motion.div
                    className="step-icon"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {step.icon}
                  </motion.div>
                  <div className="step-info">
                    <div className="step-name">{step.name}</div>
                    {step.time && <div className="step-time">{step.time}</div>}
                    {step.assignee && <div className="step-assignee">{step.assignee}</div>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="workflow-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              {[
                { text: '✅ Approve', className: 'approve' },
                { text: '❌ Reject', className: 'reject' },
                { text: '💬 Comment', className: 'comment' },
              ].map((btn, index) => (
                <motion.button
                  key={index}
                  className={`action-btn ${btn.className}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {btn.text}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
