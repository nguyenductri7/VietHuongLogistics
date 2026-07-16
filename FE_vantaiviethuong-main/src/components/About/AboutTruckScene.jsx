import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

const INIT_ROT_Y = Math.PI * 1.5
const TRUCK_MODEL_URL = '/models/truck-optimized.glb'

function InvalidateOnScroll({ invalidateRef }) {
  const { invalidate } = useThree()

  useEffect(() => {
    invalidateRef.current = invalidate
  }, [invalidate, invalidateRef])

  return null
}

function CameraSetup() {
  const { camera } = useThree()

  useEffect(() => {
    camera.lookAt(-0.2, 1.8, -2)
  }, [camera])

  return null
}

function Truck({ targetRef }) {
  const { scene } = useGLTF(TRUCK_MODEL_URL)
  const meshRef = useRef()
  const cur = useRef({ rotY: INIT_ROT_Y, posX: 0 })
  const ready = useRef(false)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    if (!scene) return
    const box = new THREE.Box3().setFromObject(scene)
    setOffsetY(-box.min.y)
    if (meshRef.current) meshRef.current.rotation.y = INIT_ROT_Y
    ready.current = true
  }, [scene])

  useFrame(({ invalidate }, delta) => {
    if (!meshRef.current || !ready.current) return
    const alpha = 1 - Math.pow(0.003, delta)
    const dRotY = targetRef.current.rotY - cur.current.rotY
    const dPosX = targetRef.current.posX - cur.current.posX
    cur.current.rotY += dRotY * alpha
    cur.current.posX += dPosX * alpha
    meshRef.current.rotation.y = cur.current.rotY
    meshRef.current.position.x = cur.current.posX

    if (Math.abs(dRotY) > 0.0001 || Math.abs(dPosX) > 0.0001) invalidate()
  })

  return <primitive ref={meshRef} object={scene} scale={1.1} position={[0, offsetY, 0]} />
}

useGLTF.preload(TRUCK_MODEL_URL)

export default function AboutTruckScene({ targetRef, invalidateRef }) {
  const [renderQuality] = useState(() => {
    if (typeof window === 'undefined') return { antialias: true, dpr: 1 }
    const cpuCores = navigator.hardwareConcurrency || 8
    const memory = navigator.deviceMemory || 8
    const constrained = window.matchMedia('(max-width: 960px)').matches || cpuCores <= 4 || memory <= 4
    return {
      antialias: !constrained,
      dpr: constrained ? 1 : [1, 1.1],
    }
  })

  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [-1, 10, 24], fov: 21 }}
      gl={{
        alpha: true,
        antialias: renderQuality.antialias,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      dpr={renderQuality.dpr}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <InvalidateOnScroll invalidateRef={invalidateRef} />
        <CameraSetup />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} />
        <directionalLight position={[-5, 4, -3]} intensity={0.8} />
        <Truck targetRef={targetRef} />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.28}
          scale={18}
          blur={2.5}
          far={4}
          frames={1}
          resolution={128}
        />
        <Environment preset="city" background={false} />
      </Suspense>
    </Canvas>
  )
}
