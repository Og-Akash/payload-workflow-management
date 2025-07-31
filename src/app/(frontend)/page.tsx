import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Demo from '@/components/landing/Demo'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="landing-page">
      <Hero user={user} adminUrl={payloadConfig.routes.admin} />
      <Features />
      <HowItWorks />
      <Demo />
      <CTA user={user} adminUrl={payloadConfig.routes.admin} />
      <Footer />
    </div>
  )
}
