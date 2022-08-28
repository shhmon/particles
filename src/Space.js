import * as THREE from 'three'

class Space {
    constructor(scene, ...groups) {
        this.scene = scene
        this.groups = groups
        this.cloud = groups.reduce((acc, cur) => acc.concat(cur), [])
    }

    init() {
        this.cloud.forEach((p) => {
            p.randomPos()
            this.scene.add(p.mesh)
        })
    }

    update() {
        this.cloud.forEach((p) => {
            p.update()
        })
    }

    spreadParticles(boundX = 11, boundY = 11, boundZ = 11) {
        this.cloud.forEach((p) =>
            p.setPosition({
                x: THREE.MathUtils.randFloat(-boundX, boundX),
                y: THREE.MathUtils.randFloat(-boundY, boundY),
                z: THREE.MathUtils.randFloat(-boundZ, boundZ),
            })
        )
    }

    find(mesh) {
        return this.cloud.find((p) => p.mesh == mesh.object)
    }
}

export default Space
