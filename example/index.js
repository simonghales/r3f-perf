import 'react-app-polyfill/ie11';
import React, { useState, useRef, Suspense, useEffect, useCallback } from 'react'
import * as ReactDOM from 'react-dom';
import { Perf } from '../dist';
import './index.css'
import * as THREE from 'three'
import {Instances, Stars} from './instances';
import { Environment } from '@react-three/drei'
import { EffectComposer, SSAO } from 'react-postprocessing'
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber'
import { RoundedBoxBufferGeometry } from 'three/examples/jsm/geometries/RoundedBoxBufferGeometry'
import perlin3 from './perlin'

extend({ RoundedBoxBufferGeometry })

const NUM = 5
const TOT = NUM * NUM * NUM
function Cubes({ scale: s = 1, ...props }) {
  const ref = useRef()
  const { clock } = useThree()
  const [objects] = useState(() => [...new Array(TOT)].map(() => new THREE.Object3D()))

  const update = useCallback(() => {
    const positions = []
    const time = clock.getElapsedTime() * (1 + 60 * Math.random())
    const threshold = 0.05 + 0.05 * Math.random()
    for (let z = -NUM / 2; z < NUM / 2; z += 1) {
      for (let y = -NUM / 2; y < NUM / 2; y += 1) {
        for (let x = -NUM / 2; x < NUM / 2; x += 1) {
          const noisex = perlin3(
            Math.abs(((x + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((y + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((z + 0.5) / (NUM / 2)) * time * threshold)
          )
          const noisey = perlin3(
            Math.abs(((y + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((z + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((x + 0.5) / (NUM / 2)) * time * threshold)
          )
          const noisez = perlin3(
            Math.abs(((z + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((x + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((y + 0.5) / (NUM / 2)) * time * threshold)
          )
          const noise = noisex + noisey + noisez
          positions.push(noise > 1.5 - threshold && noise < threshold + 1.5 ? 1 : 0)
        }
      }
    }
    return positions
  }, [clock])

  const [positions, set] = useState(update)
  useEffect(() => {
    const id = setInterval(() => set(update), 1000)
    return () => clearInterval(id)
  }, [update])

  const vec = new THREE.Vector3()
  useFrame(() => {
    let id = 0
    for (let z = -NUM / 2; z < NUM / 2; z += 1) {
      for (let y = -NUM / 2; y < NUM / 2; y += 1) {
        for (let x = -NUM / 2; x < NUM / 2; x += 1) {
          const s = positions[id]
          objects[id].position.set(x, y, z)
          objects[id].scale.lerp(vec.set(s, s, s), 0.2 - id / TOT / 8)
          objects[id].updateMatrix()
          ref.current.setMatrixAt(id, objects[id++].matrix)
        }
      }
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group {...props} rotation={[Math.PI / 4, Math.PI / 4, 0]} position={[1, 0, 0]}>
      <instancedMesh receiveShadow castShadow ref={ref} args={[null, null, TOT]}>
        <roundedBoxBufferGeometry args={[1 * s, 1 * s, 1 * s, 1, 0.075 * s]} />
        <meshStandardMaterial roughness={0} metalness={0} />
      </instancedMesh>
    </group>
  )
}


export default function App() {
  return (
    <Canvas concurrent shadowMap orthographic pixelRatio={[1, 2]} camera={{ position: [0, 0, 10], near: 1, far: 15, zoom: 50 }}>
      <ambientLight intensity={1} />
      <pointLight position={[-10, 0, 0]} intensity={1000} />
      <pointLight position={[10, 10, 10]} intensity={2} castShadow />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <EffectComposer multisampling={0}>
          <SSAO samples={31} radius={10} intensity={20} luminanceInfluence={0.1} color="#155083" />
        </EffectComposer>
        <Cubes position={[0, 0, 0]} rotation={[0, 0, Math.PI]} />
        {/* <Cubes position={[0, 0, 0]} rotation={[0, 0, 0]} scale={0.25} /> */}
      </Suspense>
      <Perf trackGPU={true} openByDefault={true} />
    </Canvas>
  )
}
ReactDOM.render(<App />, document.getElementById('root'));
