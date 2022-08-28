import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import * as dat from 'dat.gui'
import Particle from './Particle'
import Space from './Space'
import * as audio from './audio'
import { range } from './utils'

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
camera.position.set(0, 0, 800)
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

// ----------------------------------- ------ -----------------------------------

// Post processing
const renderScene = new RenderPass(scene, camera)
const composer = new EffectComposer(renderer)
composer.addPass(renderScene)

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.5, // Intensity
    5, // Radius
    0.1
)

composer.addPass(bloomPass)

// Tone mapping?
renderer.toneMapping = THREE.LinearToneMapping
renderer.toneMappingExposure = 1

// On resize
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

const gravity = (group1, group2, g, minF = 0.002, maxD = 0, minD = 0.5) => {
    group1.forEach((p1) => {
        let fx = 0
        let fy = 0
        let fz = 0

        // Calculate forces
        group2.forEach((p2) => {
            const [d, dx, dy, dz] = p1.distanceTo(p2)

            if (d > minD && (d < maxD || maxD == 0)) {
                const F = (g * p1.mass * p2.mass) / d

                if (Math.abs(F) > minF) {
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

const space = new Space(
    scene,
    Particle.factory(30, 7, 0.9, 0xf4743b),
    Particle.factory(25, 10, 1, 0x22ffaa),
    Particle.factory(60, 3, 0.6, 0x526aff)
)

space.init()

window.addEventListener('keydown', (e) => {
    if (e.keyCode == 32) {
        space.spreadParticles()
    }
})

var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse.clone(), camera)

    const objects = raycaster.intersectObjects(scene.children)
    const particles = objects.map((o) => space.find(o))
    particles.forEach((p) =>
        p.applyForce(
            {
                x: THREE.MathUtils.randFloat(20, 30),
                y: THREE.MathUtils.randFloat(20, 30),
                z: THREE.MathUtils.randFloat(20, 30),
            },
            1
        )
    )
})

const clock = new THREE.Clock()

let data = new Uint8Array(audio.analyser.frequencyBinCount)

const tick = async () => {
    const elapsedTime = clock.getElapsedTime()

    audio.analyser.getByteFrequencyData(data)

    if (data[5] > 234) {
        // space.spreadParticles()
        const particle = new Particle(3, 1, 0xffffff, 0)
        particle.setPosition({
            x: THREE.MathUtils.randFloat(-50, 50),
            y: THREE.MathUtils.randFloat(-50, 50),
            z: THREE.MathUtils.randFloat(-50, 50),
        })
        gravity(space.groups[0], [particle], -10)
        gravity(space.groups[1], [particle], -7)
        range(2).forEach(() => space.update())
    }

    // Update Orbital Controls
    // controls.update()

    // gravity(space.groups[1], space.groups[1], -0.15)
    gravity(space.groups[2], space.groups[2], 0.6, 0.001) // blue to blue
    gravity(space.groups[0], space.groups[0], 0.25) // orange to orange
    gravity(space.groups[1], space.groups[1], 0.15) // green to green
    // gravity(space.groups[0], space.groups[2], -0.2)
    gravity(space.groups[2], space.groups[0], -0.3, 0.001) // blue to orange
    gravity(space.groups[2], space.groups[1], -0.5, 0.001) // blue to green
    gravity(space.groups[0], space.groups[1], -0.2) // orange to green
    gravity(space.groups[0], space.groups[2], 0.2) // orange to blue
    // gravity(space.groups[1], space.groups[0], -0.1) // green to orange

    space.update()
    controls.update()

    // Render
    // renderer.render(scene, camera)
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
