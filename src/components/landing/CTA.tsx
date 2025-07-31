'use client'
import Link from 'next/link'
import React from 'react'

interface CTAProps {
  user: any
  adminUrl: string
}

const CTA: React.FC<CTAProps> = ({ user, adminUrl }) => {
  return (
    <section className="cta">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">
            Ready to Streamline Your
            <span className='gradient-text'> Workflows?</span>
          </h2>
          <p className="cta-description">
            Join teams worldwide who have transformed their approval processes with our intelligent
            workflow system. Get started today and experience the difference.
          </p>

          <div className="cta-actions">
            {user ? (
              <Link href={adminUrl} className="btn btn-primary btn-large">
                <span>Go to Admin Panel</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <Link href={adminUrl} className="btn btn-primary btn-large">
                <span>Get Started Now</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <Link
              href="https://github.com/Og-Akash/payload-workflow-management"
              className="btn btn-secondary btn-large"
              target='_blank'
            >
              <span>View on GitHub</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </Link>
          </div>

          <div className="cta-features">
            <div className="cta-feature">
              <div className="feature-icon">⚡</div>
              <span>Quick Setup</span>
            </div>
            <div className="cta-feature">
              <div className="feature-icon">🔒</div>
              <span>Self-Hosted</span>
            </div>
            <div className="cta-feature">
              <div className="feature-icon">📚</div>
              <span>Open Source</span>
            </div>
            <div className="cta-feature">
              <div className="feature-icon">🛠️</div>
              <span>Fully Customizable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA
