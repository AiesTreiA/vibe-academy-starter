"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import * as THREE from "three"
import {
  Box,
  RotateCw,
  Pause,
  Play,
  ExternalLink,
  Maximize2,
  Power,
  Compass,
  Camera,
  Layers,
} from "lucide-react"
import { UNICORN_BIBLE_VOLUMES } from "@/lib/unicorn-bible-config"

interface UnicornTetralogy3DProps {
  activeVol: 1 | 2 | 3 | 4
  onSelectVol: (vol: 1 | 2 | 3 | 4) => void
}

type FormationMode = "showcase" | "orbit" | "inspect"

/**
 * Shortest-angle interpolation so rotations never snap across +/- PI
 */
function lerpAngle(current: number, target: number, t: number): number {
  const delta = ((((target - current) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI
  return current + delta * t
}

/**
 * Generates a crisp 2D canvas texture for the 3D book spine.
 */
function createSpineTexture(
  vol: 1 | 2 | 3 | 4,
  shortTitle: string,
  accentHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 200
  canvas.height = 1200
  const ctx = canvas.getContext("2d")!

  // Deep Space Dark metallic spine gradient
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
  grad.addColorStop(0, "#02050d")
  grad.addColorStop(0.25, "#0d1b3a")
  grad.addColorStop(0.5, "#112248")
  grad.addColorStop(0.75, "#0d1b3a")
  grad.addColorStop(1, "#02050d")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Top & bottom accent bands
  ctx.fillStyle = accentHex
  ctx.fillRect(0, 0, canvas.width, 22)
  ctx.fillRect(0, canvas.height - 22, canvas.width, 22)

  // Highlighted spine hinges
  ctx.fillStyle = "rgba(255,255,255,0.22)"
  ctx.fillRect(10, 0, 3, canvas.height)
  ctx.fillRect(canvas.width - 13, 0, 3, canvas.height)

  // Volume number badge at top
  ctx.fillStyle = "#040814"
  ctx.strokeStyle = accentHex
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(34, 48, canvas.width - 68, 72, 14)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = accentHex
  ctx.font = "900 44px monospace"
  ctx.textAlign = "center"
  ctx.fillText(`0${vol}`, canvas.width / 2, 100)

  // Vertical title along spine
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2 + 25)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = "#F8FAFC"
  ctx.font = "800 38px sans-serif"
  ctx.textAlign = "center"
  ctx.fillText(`${shortTitle.toUpperCase()}   ·   VIBECODE_`, 0, 14)
  ctx.restore()

  // Bottom glowing emblem
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height - 78, 15, 0, Math.PI * 2)
  ctx.fillStyle = accentHex
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/**
 * Generates a realistic stacked paper edge texture for the pages block.
 */
function createPagesTexture(accentHex: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "#e2e8f0"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let x = 0; x < canvas.width; x += 3) {
    ctx.fillStyle = x % 6 === 0 ? "#94a3b8" : "#f1f5f9"
    ctx.fillRect(x, 0, 1.5, canvas.height)
  }

  // Dark hardcover board lip on left & right edges of the thickness
  ctx.fillStyle = "#040814"
  ctx.fillRect(0, 0, 22, canvas.height)
  ctx.fillRect(canvas.width - 22, 0, 22, canvas.height)

  ctx.fillStyle = accentHex
  ctx.fillRect(22, 0, 4, canvas.height)
  ctx.fillRect(canvas.width - 26, 0, 4, canvas.height)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/**
 * Generates a high-resolution back cover texture with QR code & synopsis.
 */
function createBackCoverTexture(
  vol: 1 | 2 | 3 | 4,
  meta: (typeof UNICORN_BIBLE_VOLUMES)[1],
  qrImg?: HTMLImageElement
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 800
  canvas.height = 1200
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "#040814"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = meta.accentHex
  ctx.fillRect(0, 0, canvas.width, 14)

  ctx.strokeStyle = "rgba(248, 250, 252, 0.24)"
  ctx.lineWidth = 2
  ctx.strokeRect(48, 44, canvas.width - 96, canvas.height - 88)

  ctx.fillStyle = "#F8FAFC"
  ctx.font = "900 36px sans-serif"
  ctx.fillText("vibecode", 84, 110)
  const w = ctx.measureText("vibecode").width
  ctx.fillStyle = meta.accentHex
  ctx.fillText("_", 84 + w + 2, 110)

  ctx.fillStyle = meta.accentHex
  ctx.font = "700 20px monospace"
  ctx.fillText(`CONTRAPORTADA · TOMO 0${vol}`, 84, 165)

  ctx.fillStyle = "#F8FAFC"
  ctx.font = "800 36px sans-serif"
  const words = meta.title.split(" ")
  let line = ""
  let y = 230
  for (const word of words) {
    const test = (line + " " + word).trim()
    if (ctx.measureText(test).width > canvas.width - 168) {
      ctx.fillText(line, 84, y)
      line = word
      y += 46
    } else {
      line = test
    }
  }
  if (line) {
    ctx.fillText(line, 84, y)
    y += 58
  }

  ctx.fillStyle = "#94a3b8"
  ctx.font = "500 24px sans-serif"
  const subWords = meta.subtitle.split(" ")
  line = ""
  for (const word of subWords) {
    const test = (line + " " + word).trim()
    if (ctx.measureText(test).width > canvas.width - 168) {
      ctx.fillText(line, 84, y)
      line = word
      y += 34
    } else {
      line = test
    }
  }
  if (line) {
    ctx.fillText(line, 84, y)
    y += 54
  }

  ctx.fillStyle = meta.accentHex
  ctx.font = "700 18px monospace"
  ctx.fillText("ÍNDICE TÁCTICO DE CAPÍTULOS:", 84, y)
  y += 34

  ctx.fillStyle = "#cbd5e1"
  ctx.font = "600 20px sans-serif"
  meta.chapters.slice(0, 6).forEach((ch) => {
    const chTxt = `0${ch.number}. ${ch.title}`
    ctx.fillText(chTxt.length > 46 ? chTxt.slice(0, 44) + "..." : chTxt, 84, y)
    y += 34
  })

  const qrBoxY = 860
  ctx.fillStyle = "rgba(15, 23, 42, 0.92)"
  ctx.strokeStyle = meta.accentHex
  ctx.lineWidth = 2
  ctx.fillRect(84, qrBoxY, canvas.width - 168, 210)
  ctx.strokeRect(84, qrBoxY, canvas.width - 168, 210)

  if (qrImg) {
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(108, qrBoxY + 25, 160, 160)
    ctx.drawImage(qrImg, 116, qrBoxY + 33, 144, 144)
  }

  ctx.fillStyle = "#F8FAFC"
  ctx.font = "800 24px sans-serif"
  ctx.fillText(`PUENTE INTERACTIVO SQR-2026`, 294, qrBoxY + 68)
  ctx.fillStyle = "#94a3b8"
  ctx.font = "500 20px sans-serif"
  ctx.fillText(`Escanea para validar el Tomo ${vol} en:`, 294, qrBoxY + 106)
  ctx.fillStyle = "#38bdf8"
  ctx.font = "700 22px monospace"
  ctx.fillText(`javiermujica.com/go/${vol}`, 294, qrBoxY + 145)

  ctx.fillStyle = "#64748b"
  ctx.font = "600 17px monospace"
  ctx.fillText(`JAVIER MUJICA · MUJICA AI LAB · ${meta.pexelsCredit}`, 84, 1120)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/**
 * Creates a radial floor glow texture for the holographic stage pedestal.
 */
function createStageFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext("2d")!

  const cx = 256
  const cy = 256
  const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 250)
  grad.addColorStop(0, "rgba(59, 130, 246, 0.32)")
  grad.addColorStop(0.45, "rgba(155, 114, 248, 0.16)")
  grad.addColorStop(0.75, "rgba(16, 185, 129, 0.06)")
  grad.addColorStop(1, "rgba(4, 8, 20, 0)")

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  // Technical radar grid rings
  ctx.strokeStyle = "rgba(59, 130, 246, 0.35)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, 220, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = "rgba(155, 114, 248, 0.28)"
  ctx.setLineDash([8, 8])
  ctx.beginPath()
  ctx.arc(cx, cy, 165, 0, Math.PI * 2)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

export function UnicornTetralogy3D({ activeVol, onSelectVol }: UnicornTetralogy3DProps) {
  const [is3DEnabled, setIs3DEnabled] = useState(true)
  const [formation, setFormation] = useState<FormationMode>("showcase")
  const [autoRotate, setAutoRotate] = useState(true)
  const [showBackCover, setShowBackCover] = useState(false)

  const mountRef = useRef<HTMLDivElement>(null)
  const activeVolRef = useRef<1 | 2 | 3 | 4>(activeVol)
  const formationRef = useRef<FormationMode>(formation)
  const autoRotateRef = useRef<boolean>(autoRotate)
  const showBackRef = useRef<boolean>(showBackCover)
  const onSelectVolRef = useRef(onSelectVol)

  useEffect(() => {
    activeVolRef.current = activeVol
  }, [activeVol])

  useEffect(() => {
    formationRef.current = formation
    if (formation !== "inspect") setShowBackCover(false)
  }, [formation])

  useEffect(() => {
    autoRotateRef.current = autoRotate
  }, [autoRotate])

  useEffect(() => {
    showBackRef.current = showBackCover
  }, [showBackCover])

  useEffect(() => {
    onSelectVolRef.current = onSelectVol
  }, [onSelectVol])

  // True WebGL / Three.js Scene Initialization
  useEffect(() => {
    if (!is3DEnabled) return
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 960
    const height = container.clientHeight || 520

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100)
    camera.position.set(0, 0.25, 9.6)
    camera.lookAt(0, -0.1, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.22
    container.innerHTML = ""
    container.appendChild(renderer.domElement)

    // Studio Lighting (Brand Manual Palette: Cool Silver + Electric Blue + Vibe Purple + Emerald)
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 1.75)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.3)
    keyLight.position.set(4, 7, 8)
    scene.add(keyLight)

    const blueRimLight = new THREE.PointLight(0x3b82f6, 4.0, 20)
    blueRimLight.position.set(-6, 2.5, 5)
    scene.add(blueRimLight)

    const purpleRimLight = new THREE.PointLight(0x9b72f8, 3.6, 20)
    purpleRimLight.position.set(6, -1.0, 5)
    scene.add(purpleRimLight)

    const emeraldFloorLight = new THREE.PointLight(0x10b981, 2.5, 16)
    emeraldFloorLight.position.set(0, -3.0, 3)
    scene.add(emeraldFloorLight)

    // 3D Holographic Stage Pedestal Disc beneath the Tetralogy
    const floorGeo = new THREE.PlaneGeometry(9.5, 5.2)
    const floorMat = new THREE.MeshBasicMaterial({
      map: createStageFloorTexture(),
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const floorDisc = new THREE.Mesh(floorGeo, floorMat)
    floorDisc.rotation.x = -Math.PI / 2
    floorDisc.position.set(0, -1.92, 0)
    scene.add(floorDisc)

    // 3D Neural Constellation Network (Nodes + Connecting Lines in 3D space)
    const neuralGroup = new THREE.Group()
    scene.add(neuralGroup)

    const nodeCount = 44
    const nodePositions: THREE.Vector3[] = []
    const nodeGeo = new THREE.SphereGeometry(0.042, 8, 8)
    const paletteHex = [0x3b82f6, 0x9b72f8, 0xec4899, 0x10b981, 0xf97316]

    for (let i = 0; i < nodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 13,
        (Math.random() - 0.5) * 5.2,
        -2.2 - Math.random() * 2.5
      )
      nodePositions.push(pos)
      const nMat = new THREE.MeshBasicMaterial({
        color: paletteHex[i % paletteHex.length],
        transparent: true,
        opacity: 0.7,
      })
      const nMesh = new THREE.Mesh(nodeGeo, nMat)
      nMesh.position.copy(pos)
      neuralGroup.add(nMesh)
    }

    // Connect nearby 3D neural nodes with subtle glowing lines
    const linePoints: THREE.Vector3[] = []
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 2.9) {
          linePoints.push(nodePositions[i], nodePositions[j])
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.16,
    })
    const neuralLines = new THREE.LineSegments(lineGeo, lineMat)
    neuralGroup.add(neuralLines)

    // Create the 4 Hardcover Book 3D Groups
    const textureLoader = new THREE.TextureLoader()
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()

    const bookGroups: Record<1 | 2 | 3 | 4, THREE.Group> = {} as any
    const clickableMeshes: THREE.Object3D[] = []

    const bookW = 1.98
    const bookH = 2.97
    const bookD = 0.36 // Solid 400-page hardcover thickness

    ;([1, 2, 3, 4] as const).forEach((vol) => {
      const meta = UNICORN_BIBLE_VOLUMES[vol]
      const group = new THREE.Group()
      group.userData = { vol }

      // Initial positions so first frame is already in formation
      const initIdx = vol - 2.5
      group.position.set(initIdx * 2.22, 0, vol === 1 ? 0.55 : -Math.abs(initIdx) * 0.22)
      group.rotation.y = 0.32 - initIdx * 0.18

      // Load Front Cover Texture (High-Res Pexels Editorial Cover)
      const frontTex = textureLoader.load(meta.coverImage)
      frontTex.colorSpace = THREE.SRGBColorSpace
      frontTex.anisotropy = maxAnisotropy

      const spineTex = createSpineTexture(vol, meta.shortTitle, meta.accentHex)
      const pagesTex = createPagesTexture(meta.accentHex)

      const backMat = new THREE.MeshStandardMaterial({
        map: createBackCoverTexture(vol, meta),
        roughness: 0.28,
        metalness: 0.12,
      })

      const qrImg = new window.Image()
      qrImg.crossOrigin = "anonymous"
      qrImg.onload = () => {
        const updatedBackTex = createBackCoverTexture(vol, meta, qrImg)
        updatedBackTex.anisotropy = maxAnisotropy
        backMat.map = updatedBackTex
        backMat.needsUpdate = true
      }
      qrImg.src = `/ebooks/qr/vol-${vol}.png`

      const frontMat = new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: 0.2,
        metalness: 0.14,
      })

      const spineMat = new THREE.MeshStandardMaterial({
        map: spineTex,
        roughness: 0.25,
        metalness: 0.2,
      })

      const paperMat = new THREE.MeshStandardMaterial({
        map: pagesTex,
        roughness: 0.65,
        metalness: 0.04,
      })

      // BoxGeometry faces: 0:+X (Right pages), 1:-X (Left Spine), 2:+Y (Top pages), 3:-Y (Bottom pages), 4:+Z (Front Cover), 5:-Z (Back Cover)
      const bookGeo = new THREE.BoxGeometry(bookW, bookH, bookD)
      const materials = [paperMat, spineMat, paperMat, paperMat, frontMat, backMat]
      const bookMesh = new THREE.Mesh(bookGeo, materials)
      bookMesh.userData = { vol }
      group.add(bookMesh)
      clickableMeshes.push(bookMesh)

      // Subtle glowing halo outline behind active book
      const frameGeo = new THREE.PlaneGeometry(bookW + 0.14, bookH + 0.14)
      const frameMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(meta.accentHex),
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
      })
      const glowFrame = new THREE.Mesh(frameGeo, frameMat)
      glowFrame.position.z = -bookD / 2 - 0.02
      group.add(glowFrame)
      group.userData.glowFrame = glowFrame

      scene.add(group)
      bookGroups[vol] = group
    })

    // Pointer Drag & Raycast Click Interaction
    let isDragging = false
    let dragDist = 0
    let prevX = 0
    let prevY = 0
    let userYawOffset = 0
    let userPitchOffset = 0
    let orbitClockAngle = 0
    let hoveredVol: 1 | 2 | 3 | 4 | null = null

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      dragDist = 0
      prevX = e.clientX
      prevY = e.clientY
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      if (isDragging) {
        const dx = e.clientX - prevX
        const dy = e.clientY - prevY
        dragDist += Math.hypot(dx, dy)
        prevX = e.clientX
        prevY = e.clientY

        userYawOffset += dx * 0.011
        userPitchOffset = Math.max(-0.4, Math.min(0.4, userPitchOffset + dy * 0.007))
      } else {
        raycaster.setFromCamera(pointer, camera)
        const hits = raycaster.intersectObjects(clickableMeshes, false)
        if (hits.length > 0) {
          hoveredVol = hits[0].object.userData.vol as 1 | 2 | 3 | 4
          renderer.domElement.style.cursor = "pointer"
        } else {
          hoveredVol = null
          renderer.domElement.style.cursor = "grab"
        }
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging && dragDist < 8) {
        const rect = renderer.domElement.getBoundingClientRect()
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(pointer, camera)
        const hits = raycaster.intersectObjects(clickableMeshes, false)
        if (hits.length > 0) {
          const clickedVol = hits[0].object.userData.vol as 1 | 2 | 3 | 4
          if (clickedVol) {
            onSelectVolRef.current(clickedVol)
            userYawOffset = 0
            userPitchOffset = 0
          }
        }
      }
      isDragging = false
    }

    const domElem = renderer.domElement
    domElem.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)

    const ro = new ResizeObserver(() => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      const isMobile = w < 640
      camera.position.z = isMobile ? 12.2 : 9.6
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(container)

    let rafId: number
    const clock = new THREE.Clock()

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.1)
      const elapsed = clock.getElapsedTime()
      const currentActive = activeVolRef.current
      const mode = formationRef.current
      const isAuto = autoRotateRef.current

      if (isAuto && !isDragging) {
        orbitClockAngle += dt * 0.42
      }

      // Gently animate background neural constellation
      neuralGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.08 + userYawOffset * 0.15
      neuralGroup.rotation.x = userPitchOffset * 0.15

      ;([1, 2, 3, 4] as const).forEach((vol) => {
        const group = bookGroups[vol]
        const isSelected = vol === currentActive
        const isHovered = vol === hoveredVol
        const floatY = Math.sin(elapsed * 1.7 + vol * 1.4) * 0.065

        let targetX = 0
        let targetY = floatY
        let targetZ = 0
        let targetRotX = userPitchOffset * 0.5
        let targetRotY = 0
        let targetScale = 1

        if (mode === "showcase") {
          // Balanced 3D Amphitheater Arc: shows both the 3D Spine ("01..04") and Front Cover of all 4 books cleanly
          const idx = vol - 2.5 // -1.5, -0.5, 0.5, 1.5
          targetX = idx * 2.22
          targetZ = isSelected ? 0.62 : -Math.abs(idx) * 0.24
          targetY = floatY + (isSelected ? 0.14 : 0) + (isHovered ? 0.08 : 0)
          // Slight positive Y angle reveals the left hardcover spine on every volume
          const gentleSway = isAuto && !isDragging ? Math.sin(elapsed * 0.85 + vol * 0.9) * 0.14 : 0
          targetRotY = 0.34 - idx * 0.18 + gentleSway + userYawOffset
          targetScale = isSelected ? 1.07 : 0.96
        } else if (mode === "orbit") {
          // Evenly spaced 4-Book 360° Orbital Ring
          const baseAngle = ((vol - currentActive) * Math.PI) / 2 + orbitClockAngle + userYawOffset
          const radiusX = 3.25
          const radiusZ = 1.95
          targetX = Math.sin(baseAngle) * radiusX
          targetZ = Math.cos(baseAngle) * radiusZ
          targetY = floatY + (isSelected ? 0.08 : 0)
          // Full 360 rotation synchronized with orbital position so spine, front, pages, and back cover all shine
          targetRotY = baseAngle + 0.38
          targetScale = 0.96 + 0.08 * Math.cos(baseAngle)
        } else {
          // Single-Book 360° Close-Up Inspector
          if (isSelected) {
            targetX = 0
            targetY = floatY * 0.5 + 0.05
            targetZ = 2.25
            const flipOffset = showBackRef.current ? Math.PI : 0
            const inspectSway = isAuto && !isDragging ? Math.sin(elapsed * 0.9) * 0.38 : 0
            targetRotY = 0.38 + flipOffset + inspectSway + userYawOffset
            targetRotX = 0.05 + userPitchOffset
            targetScale = 1.18
          } else {
            const sideIdx = vol < currentActive ? vol - 2.5 : vol - 1.5
            targetX = sideIdx * 2.75
            targetY = -0.22 + floatY * 0.4
            targetZ = -2.2
            targetRotY = 0.25 - sideIdx * 0.25
            targetScale = 0.72
          }
        }

        const lerpFactor = 1 - Math.exp(-8.0 * dt)
        group.position.x = THREE.MathUtils.lerp(group.position.x, targetX, lerpFactor)
        group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, lerpFactor)
        group.position.z = THREE.MathUtils.lerp(group.position.z, targetZ, lerpFactor)

        group.rotation.x = lerpAngle(group.rotation.x, targetRotX, lerpFactor)
        group.rotation.y = lerpAngle(group.rotation.y, targetRotY, lerpFactor)

        const s = THREE.MathUtils.lerp(group.scale.x, targetScale, lerpFactor)
        group.scale.set(s, s, s)

        const glowFrame = group.userData.glowFrame as THREE.Mesh<
          THREE.PlaneGeometry,
          THREE.MeshBasicMaterial
        >
        if (glowFrame) {
          glowFrame.material.opacity = THREE.MathUtils.lerp(
            glowFrame.material.opacity,
            isSelected ? 0.24 : 0.0,
            lerpFactor
          )
        }
      })

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      domElem.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      renderer.dispose()
    }
  }, [is3DEnabled])

  const currentMeta = UNICORN_BIBLE_VOLUMES[activeVol]

  return (
    <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-[#4285F4]/60 via-[#9B72F8]/60 to-[#F97316]/60 shadow-[0_0_70px_-15px_rgba(59,130,246,0.35)]">
      <div className="relative rounded-3xl bg-[#040814]/95 backdrop-blur-2xl overflow-hidden border border-white/10">
        {/* Ambient Vibecode AI Gradient Auras */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#3B82F6]/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-[#9B72F8]/15 rounded-full blur-[110px] pointer-events-none" />

        {/* TOP HARDWARE CONTROL DECK (WITH THE 3D IMMERSIVE SWITCH) */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 border-b border-white/10 bg-[#040814]/85 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#3B82F6] font-bold">
              <Box className="w-4 h-4 text-[#3B82F6]" />
              vibecode_ WebGL 3D Engine
            </span>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              Fotografía Real Pexels HD · Renderizado Three.js GPU
            </span>
          </div>

          {/* Controls & Hardware Toggle Switch */}
          <div className="flex flex-wrap items-center gap-2">
            {is3DEnabled && (
              <>
                <div className="inline-flex rounded-xl bg-slate-900/90 p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setFormation("showcase")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      formation === "showcase"
                        ? "bg-[#3B82F6] text-white shadow-md shadow-blue-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Diorama 3D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormation("orbit")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      formation === "orbit"
                        ? "bg-[#3B82F6] text-white shadow-md shadow-blue-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Órbita 360°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormation("inspect")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      formation === "inspect"
                        ? "bg-[#9B72F8] text-slate-950 shadow-md shadow-purple-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Inspección Tomo {activeVol}</span>
                  </button>
                </div>

                {formation === "inspect" && (
                  <button
                    type="button"
                    onClick={() => setShowBackCover((prev) => !prev)}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#9B72F8]/20 hover:bg-[#9B72F8]/30 text-purple-200 border border-[#9B72F8]/40 transition-all flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{showBackCover ? "Ver Portada" : "Ver Contraportada + QR"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAutoRotate((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
                >
                  {autoRotate ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Movimiento: ON</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">Movimiento: PAUSA</span>
                    </>
                  )}
                </button>
              </>
            )}

            {/* MASTER 3D IMMERSIVE SWITCH */}
            <button
              type="button"
              role="switch"
              aria-checked={is3DEnabled}
              onClick={() => setIs3DEnabled((prev) => !prev)}
              className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                is3DEnabled
                  ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                  : "bg-slate-900/90 border-white/15 text-slate-400 hover:text-white"
              }`}
            >
              <Power
                className={`w-3.5 h-3.5 transition-transform ${
                  is3DEnabled ? "text-emerald-400 scale-110" : "text-slate-500"
                }`}
              />
              <span>INTERRUPTOR WEB 3D:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider ${
                  is3DEnabled ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-400"
                }`}
              >
                {is3DEnabled ? "ON" : "OFF (2D)"}
              </span>
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* STAGE BODY: TRUE THREE.JS WEBGL STAGE VS 2D HIGH-RES EDITORIAL GRID */}
        {/* ================================================================== */}
        {is3DEnabled ? (
          <div className="relative z-10 flex flex-col items-center pb-6">
            {/* WebGL Canvas Mount */}
            <div
              ref={mountRef}
              className="w-full h-[440px] sm:h-[510px] select-none cursor-grab active:cursor-grabbing"
            />

            {/* Active Volume HUD Bar + Selector Pills */}
            <div className="w-full max-w-5xl mx-auto px-4 space-y-4 -mt-2">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {([1, 2, 3, 4] as const).map((v) => {
                  const meta = UNICORN_BIBLE_VOLUMES[v]
                  const active = activeVol === v
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onSelectVol(v)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                        active
                          ? "bg-slate-900 text-white border-white/40 shadow-lg scale-105"
                          : "bg-slate-950/80 text-slate-400 border-white/10 hover:text-white hover:border-white/25"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: meta.accentHex }}
                      />
                      <span>
                        Tomo {v}: {meta.shortTitle}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-[11px] font-mono text-slate-400">
                <span>
                  💡 <strong className="text-slate-200">Interacción WebGL 3D:</strong> Arrastra para rotar la escena en 3D o haz clic directamente sobre cualquier libro.
                </span>
                <span className="text-blue-300 shrink-0">
                  Edición Oficial 2026 · PDF + Markdown (.md)
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================== */
          /* 2D HIGH-RESOLUTION EDITORIAL COVER GALLERY (WHEN 3D SWITCH IS OFF) */
          /* ================================================================== */
          <div className="relative z-10 p-6 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {([1, 2, 3, 4] as const).map((v) => {
                const meta = UNICORN_BIBLE_VOLUMES[v]
                const isSelected = activeVol === v
                return (
                  <div
                    key={v}
                    onClick={() => onSelectVol(v)}
                    className={`group cursor-pointer rounded-2xl p-3 transition-all border ${
                      isSelected
                        ? "bg-slate-900/95 border-[#3B82F6] ring-2 ring-[#3B82F6]/40 shadow-2xl -translate-y-1"
                        : "bg-slate-950/80 border-white/10 hover:border-white/25 hover:-translate-y-1"
                    }`}
                  >
                    <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden border border-white/15 bg-[#040814]">
                      <Image
                        src={meta.coverImage}
                        alt={meta.title}
                        fill
                        sizes="(max-width: 768px) 90vw, 25vw"
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                    <div className="mt-3 space-y-1 text-left">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span style={{ color: meta.accentHex }} className="font-bold">
                          TOMO 0{v} · {meta.dimensionLabel.toUpperCase()}
                        </span>
                        <span className="text-slate-400">
                          {meta.chapters.length} caps
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {meta.shortTitle}
                      </h4>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
