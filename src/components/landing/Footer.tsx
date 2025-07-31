'use client'
import Link from 'next/link'
import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🚀</span>
              <span className="logo-text">Workflow Management</span>
            </div>
            <p className="footer-description">
              A complete, self-hosted workflow orchestration layer built with Payload CMS v3 + Next.js 15.
            </p>
            <div className="footer-social">
              <Link href="https://github.com/Og-Akash/payload-workflow-management" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Features</h4>
            <ul className="footer-links">
              <li><Link target='_blank' href="#features">Dynamic Workflows</Link></li>
              <li><Link target='_blank' href="#features">Role-Based Access</Link></li>
              <li><Link target='_blank' href="#features">Audit Trail</Link></li>
              <li><Link target='_blank' href="#features">REST API</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Documentation</h4>
            <ul className="footer-links">
              <li><Link target='_blank' href="https://payloadcms.com/docs">Payload CMS Docs</Link></li>
              <li><Link target='_blank' href="https://nextjs.org/docs">Next.js Docs</Link></li>
              <li><Link target='_blank' href="#how-it-works">How It Works</Link></li>
              <li><Link target='_blank' href="#demo">Demo</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><Link target='_blank' href="https://github.com/Og-Akash/payload-workflow-management">GitHub Repository</Link></li>
              <li><Link target='_blank' href="https://payloadcms.com">Payload CMS</Link></li>
              <li><Link target='_blank' href="https://nextjs.org">Next.js</Link></li>
              <li><Link target='_blank' href="https://postgresql.org">PostgreSQL</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} Workflow Management System. Built with ❤️ using Payload CMS & Next.js.</p>
          </div>
          <div className="footer-tech">
            <span className="tech-badge">Payload CMS v3</span>
            <span className="tech-badge">Next.js 15</span>
            <span className="tech-badge">PostgreSQL</span>
            <span className="tech-badge">TypeScript</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 