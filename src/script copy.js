import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { range } from './utils'

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const getParticles = (n, color = 0xffffff, size = 1) => {
    const geometry = new THREE.SphereGeometry(size, 32, 32)
    const material = new THREE.MeshStandardMaterial({
        roughness: 0,
        metalness: 0.1,
    })
    material.color = new THREE.Color(color)
    const particle = new THREE.Mesh(geometry, material)

    return range(n).map(() => {
        const atom = particle.clone()
        atom.position.x = THREE.MathUtils.randFloat(-100, 100)
        atom.position.y = THREE.MathUtils.randFloat(-100, 100)
        atom.position.z = THREE.MathUtils.randFloat(-100, 100)
        atom.vx = 1
        atom.vy = 2
        atom.vz = 1
        return atom
    })
}

const rule = (particles1, particles2, g) => {
    particles1.forEach((p1) => {
        let fx = 0
        let fy = 0
        let fz = 0

        // Calculate forces
        particles2.forEach((p2) => {
            // const d = p1.position.distanceTo(p2.position)
            // const { x, y } = p1.position.manhattanDistanceTo(p2.position)
            const d = p1.position.distanceTo(p2.position)
            const dx = p1.position.x - p2.position.x
            const dy = p1.position.y - p2.position.y
            const dz = p1.position.z - p2.position.z
            // const d = Math.sqrt(dx * dx + dy * dy)

            if (d > 0 && d < 100) {
                const F = (g * 1) / d
                fx += F * dx
                fy += F * dy
                fz += F * dz
            }
        })

        // Update velocities and positions
        p1.vx = (p1.vx + fx) * 0.95
        p1.vy = (p1.vy + fy) * 0.95
        p1.vz = (p1.vz + fz) * 0.95
        p1.position.x += p1.vx
        p1.position.y += p1.vy
        p1.position.z += p1.vz

        // p1.position.x += fx * 0.5
        // p1.position.y += fy * 0.5

        // Constrain to window bounds
        if (p1.position.x <= -200 || p1.position.x >= 200) {
            p1.vx *= -1
        }
        if (p1.position.y <= -100 || p1.position.y >= 100) {
            p1.vy *= -1
        }
        if (p1.position.z <= -100 || p1.position.z >= 100) {
            p1.vz *= -1
        }
    })
}

const particles1 = getParticles(100, 0x5566ff)
const particles2 = getParticles(20, 0xff0052, 5)
particles1.forEach((p) => scene.add(p))
particles2.forEach((p) => scene.add(p))

// Lights
const pointLight = new THREE.PointLight(0xffffff, 1, 1000)
pointLight.position.x = 0
pointLight.position.y = 0
pointLight.position.z = 100
scene.add(pointLight)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(
    50,
    sizes.width / sizes.height,
    0.1,
    1000
)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 500
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

window.addEventListener('keydown', (e) => {
    if (e.keyCode == 32) {
        ;[...particles1, ...particles2].forEach((p) => {
            p.position.x = 0
            p.position.y = 0
            p.position.z = 0
        })
    }
})

const tick = async () => {
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    // sphere.rotation.y = 0.5 * elapsedTime

    // Update Orbital Controls
    // controls.update()

    rule(particles1, particles1, 0.4)
    rule(particles2, particles2, 0.6)
    rule(particles1, particles2, -1)
    // await new Promise((r) => setTimeout(r, 100))

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
