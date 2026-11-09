import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MotionConfig } from 'motion/react'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
