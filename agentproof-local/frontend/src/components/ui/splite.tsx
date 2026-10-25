'use client'

import React, { Suspense, lazy, useState } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  fallbackComponent?: React.ReactNode
}

export function SplineScene({ scene, className, fallbackComponent }: SplineSceneProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError && fallbackComponent) {
    return <>{fallbackComponent}</>
  }

  return (
    <Suspense 
      fallback={
        <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0A0C11]/50 p-6 text-center">
          <span className="loader mb-3"></span>
          <span className="text-xs font-mono text-white tracking-wider animate-pulse">
            LOADING 3D SECURITY SCENE...
          </span>
          <span className="text-[10px] font-mono text-[#727B8D] mt-1">
            Streaming WebGL assets from Spline Cloud
          </span>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        onError={() => {
          console.warn("Spline scene loading issue, utilizing high-fidelity visual fallback.")
          setHasError(true)
        }}
      />
    </Suspense>
  )
}
