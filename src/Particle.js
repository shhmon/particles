import * as THREE from 'three'
import { range } from './utils'

const PARTICLE_BOUNDS = 500

class Particle {
    constructor(size = 1, mass = 1, color = 0xffffff) {
        this.mass = mass
        this.geometry = new THREE.SphereGeometry(size, 16, 16)
        // this.material = new THREE.MeshPhongMaterial()
        // this.material.shininess = 100
        // this.material.specular = 100
        this.material = new THREE.MeshBasicMaterial()
        // this.material = new THREE.MeshStandardMaterial({
        //     roughness: 0.5,
        //     metalness: 0.1,
        // })

        this.material.color = new THREE.Color(color)
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.stop()
    }

    stop() {
        this.vx = 0
        this.vy = 0
        this.vz = 0
    }

    setPosition(position) {
        this.mesh.position.x = position.x
        this.mesh.position.y = position.y
        this.mesh.position.z = position.z
    }

    origin() {
        this.setPosition({ x: 0, y: 0, z: 0 })
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

export default Particle
