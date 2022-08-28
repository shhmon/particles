import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
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

// Lights
const pointLight = new THREE.PointLight(0xffffff, 1, 1000)
pointLight.position.x = 0
pointLight.position.y = 0
pointLight.position.z = 100
scene.add(pointLight)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const camera = new THREE.PerspectiveCamera(
    50,
    sizes.width / sizes.height,
    0.1,
    1000
)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 200
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
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

const PARTICLE_BOUNDS = 100
class Particle {
    constructor(size = 1, mass = 1, color = 0xffffff) {
        this.mass = mass
        this.geometry = new THREE.SphereGeometry(size, 16, 16)
        this.material = new THREE.MeshStandardMaterial({
            roughness: 0,
            metalness: 0.1,
        })

        this.material.color = new THREE.Color(color)
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.stop()
    }

    stop() {
        this.vx = 0
        this.vy = 0
        this.vz = 0
    }

    randomPos() {
        this.mesh.position.x = THREE.MathUtils.randFloat(
            -PARTICLE_BOUNDS,
            PARTICLE_BOUNDS
        )
        this.mesh.position.y = THREE.MathUtils.randFloat(
            -PARTICLE_BOUNDS,
            PARTICLE_BOUNDS
        )
        this.mesh.position.z = THREE.MathUtils.randFloat(
            -PARTICLE_BOUNDS,
            PARTICLE_BOUNDS
        )
    }

    distanceTo(particle) {
        const d = this.mesh.position.distanceTo(particle.mesh.position)
        const dx = this.mesh.position.x - particle.mesh.position.x
        const dy = this.mesh.position.y - particle.mesh.position.y
        const dz = this.mesh.position.z - particle.mesh.position.z
        return [d, dx, dy, dz]
    }

    applyForce(force, decay) {
        this.vx = (this.vx + force.x) * decay
        this.vy = (this.vy + force.y) * decay
        this.vz = (this.vz + force.z) * decay
    }

    update() {
        // Constrain to bounds
        if (
            this.mesh.position.x <= -PARTICLE_BOUNDS ||
            this.mesh.position.x >= PARTICLE_BOUNDS
        ) {
            this.vx *= -1
        }
        if (
            this.mesh.position.y <= -PARTICLE_BOUNDS ||
            this.mesh.position.y >= PARTICLE_BOUNDS
        ) {
            this.vy *= -1
        }
        if (
            this.mesh.position.z <= -PARTICLE_BOUNDS ||
            this.mesh.position.z >= PARTICLE_BOUNDS
        ) {
            this.vz *= -1
        }

        this.mesh.position.x += this.vx
        this.mesh.position.y += this.vy
        this.mesh.position.z += this.vz
    }

    static factory(n, size, mass, color) {
        return range(n).map(() => new Particle(size, mass, color))
    }
}

const rule = (group1, group2, g) => {
    group1.forEach((p1) => {
        let fx = 0
        let fy = 0
        let fz = 0

        // Calculate forces
        group2.forEach((p2) => {
            const [d, dx, dy, dz] = p1.distanceTo(p2)

            if (d > 1 && d < 200) {
                const F = (g * 1) / d
                fx += F * dx
                fy += F * dy
                fz += F * dz
            }
        })

        // Update velocity
        p1.applyForce({ x: fx, y: fy, z: fz }, 0.96)
    })
}

const group1 = Particle.factory(10, 1, 1, 0xff6613)
group1.forEach((p) => {
    p.randomPos()
    scene.add(p.mesh)
})

const clock = new THREE.Clock()

window.addEventListener('keydown', (e) => {
    if (e.keyCode == 32) {
        group1.forEach((p) => p.randomPos(p))
    }
})

const tick = async () => {
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    // sphere.rotation.y = 0.5 * elapsedTime

    // Update Orbital Controls
    // controls.update()

    rule(group1, group1, -0.2)
    group1.forEach((p) => p.update())
    // await new Promise((r) => setTimeout(r, 100))

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
