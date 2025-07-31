'use client'
import React from 'react'
import { motion } from 'framer-motion'

const Demo: React.FC = () => {
  return (
    <section className="demo" id="demo">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">
            See It In
            <span className="gradient-text"> Action</span>
          </h2>
          <p className="section-description">
            Watch how seamlessly the workflow interface integrates into your existing Payload CMS
            admin panel.
          </p>
        </motion.div>

        <motion.div
          className="demo-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="demo-sidebar"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="demo-sidebar-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <h3>Workflow Tab</h3>
              <motion.div
                className="demo-status in-progress"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8, type: 'spring' }}
                viewport={{ once: true }}
              >
                In Progress
              </motion.div>
            </motion.div>

            <motion.div
              className="demo-workflow-info"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="demo-document"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                viewport={{ once: true }}
              >
                <h4>Contract: Service Agreement #2024-001</h4>
                <p>Amount: $50,000 | Type: Service Agreement</p>
              </motion.div>

              <motion.div
                className="demo-current-step"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                viewport={{ once: true }}
              >
                <h5>Current Step: Legal Review</h5>
                <p>Assigned to: Legal Team</p>
                <motion.div
                  className="demo-step-progress"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                  viewport={{ once: true }}
                >
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      style={{ width: '60%' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: '60%' }}
                      transition={{ duration: 1, delay: 1.6, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    ></motion.div>
                  </div>
                  <span>Step 2 of 3</span>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="demo-actions"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              viewport={{ once: true }}
            >
              <h5>Available Actions</h5>
              <motion.textarea
                className="demo-comment-input"
                placeholder="Add a comment (optional)"
                defaultValue="Contract terms look good, but need clarification on section 3.2"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.8 }}
                viewport={{ once: true }}
                whileFocus={{ scale: 1.02 }}
              />
              <motion.div
                className="demo-action-buttons"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.0 }}
                viewport={{ once: true }}
              >
                <motion.button
                  className="demo-btn approve"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  ✅ Approve
                </motion.button>
                <motion.button
                  className="demo-btn reject"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  ❌ Reject
                </motion.button>
                <motion.button
                  className="demo-btn comment"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  💬 Add Comment
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="demo-main"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="demo-activity-log"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <h4>📋 Activity Log</h4>
              <div className="demo-log-entries">
                {[
                  {
                    step: 'Initial Review',
                    action: 'approved',
                    time: '2 hours ago',
                    comment: 'Document content looks good, proceeding to legal review',
                  },
                  {
                    step: 'Workflow Started',
                    action: 'started',
                    time: '3 hours ago',
                  },
                  {
                    step: 'Document Created',
                    action: 'created',
                    time: '3 hours ago',
                  },
                ].map((log, index) => (
                  <motion.div
                    key={index}
                    className="demo-log-entry"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 + index * 0.2 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <div className="log-header">
                      <span className="log-step">{log.step}</span>
                      <span className={`log-action ${log.action}`}>
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </span>
                      <span className="log-time">{log.time}</span>
                    </div>
                    {log.comment && (
                      <motion.div
                        className="log-comment"
                        initial={{ opacity: 0, height: 0 }}
                        whileInView={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.4, delay: 1.2 + index * 0.2 }}
                        viewport={{ once: true }}
                      >
                        <span className="log-comment-label">💬</span>
                        <span>{log.comment}</span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="demo-features"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {[
            {
              icon: '🎯',
              title: 'Inline Actions',
              description: 'Approve, reject, or comment directly from the document interface',
            },
            {
              icon: '📊',
              title: 'Real-time Status',
              description: 'See current workflow status and progress at a glance',
            },
            {
              icon: '🔍',
              title: 'Complete Audit Trail',
              description: 'Every action is logged with timestamps and user information',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="demo-feature"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <motion.div
                className="feature-icon"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {feature.icon}
              </motion.div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="demo-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Approval Process?
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            viewport={{ once: true }}
          >
            Experience the power of intelligent workflows in your own environment.
          </motion.p>
          <motion.div
            className="demo-cta-buttons"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            viewport={{ once: true }}
          >
            <motion.a
              target="_blank"
              href="/admin"
              className="btn btn-primary"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <span>Try Demo</span>
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
            </motion.a>
            <motion.a
              href="#features"
              className="btn btn-secondary"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <span className='gradient-text'>Learn More</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Demo
