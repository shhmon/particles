import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js'
import * as dat from 'dat.gui'
import Particle from './Particle'

// ----------------------------------- Setup -----------------------------------

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0x303030)

const camera = new THREE.PerspectiveCamera(
    50,
    sizes.width / sizes.height,
    0.1,
    2000
)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 800
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 1

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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

// ----------------------------------- ------ -----------------------------------

const gravity = (group1, group2, g, minF = 0.0, maxD = 300, minD = 0) => {
    group1.forEach((p1) => {
        let fx = 0
        let fy = 0
        let fz = 0

        // Calculate forces
        group2.forEach((p2) => {
            const [d, dx, dy, dz] = p1.distanceTo(p2)

            if (d > minD && d < maxD) {
                const F = (g * p1.mass * p2.mass) / d

                if (F > minF) {
                    fx += F * dx
                    fy += F * dy
                    fz += F * dz
                }
            }
        })

        // Update velocity
        p1.applyForce({ x: fx, y: fy, z: fz }, 0.96)
    })
}

const group1 = Particle.factory(20, 5, 2, 0xf4743b)
const group2 = Particle.factory(40, 2, 1, 0x574ae2)
const group3 = Particle.factory(20, 10, 3, 0x22ffaa)
const cloud = [...group1, ...group2, ...group3]

cloud.forEach((p) => {
    p.randomPos()
    scene.add(p.mesh)
})

const clock = new THREE.Clock()

window.addEventListener('keydown', (e) => {
    if (e.keyCode == 32) {
        cloud.forEach((p) =>
            p.setPosition({
                x: THREE.MathUtils.randFloat(-40, 40),
                y: THREE.MathUtils.randFloat(-40, 40),
                z: THREE.MathUtils.randFloat(-40, 40),
            })
        )
    }
})

const tick = async () => {
    const elapsedTime = clock.getElapsedTime()

    // Update Orbital Controls
    // controls.update()

    gravity(group1, group1, 0.3)
    gravity(group2, group2, 0.4)
    gravity(group2, group1, -0.4)
    gravity(group1, group2, -0.1)
    gravity(group3, group3, 0.2)
    gravity(group1, group3, -0.6)
    cloud.forEach((p) => p.update())

    // Render
    renderer.render(scene, camera)
    controls.update()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
