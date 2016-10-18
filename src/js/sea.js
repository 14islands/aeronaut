import * as THREE from 'three'
import Colors from './colors'

class Sea {
  constructor (GROUND_DIAMETER) {
    const geom = new THREE.SphereGeometry(GROUND_DIAMETER, 50, 50)

    // important: by merging vertices we ensure the continuity of the waves
    geom.mergeVertices()

    const l = geom.vertices.length
    this.waves = []

    for (let i = 0; i < l; i++) {
      const v = geom.vertices[i]

      // store some data associated to it
      this.waves.push({y: v.y,
                       x: v.x,
                       z: v.z,
                       // a random angle
                       ang: Math.random() * Math.PI * 2,
                       // a random distance
                       amp: 5 + Math.random() * 25,
                       // a random speed between 0.016 and 0.048 radians / frame
                       speed: 0.016 + Math.random() * 0.032
      })
    }

    const mat = new THREE.MeshPhongMaterial({
      color: Colors.water,
      transparent: true,
      opacity: 1,
      shading: THREE.FlatShading,
      wireframe: false
    })

    this.mesh = new THREE.Mesh(geom, mat)

    // Allow the sea to receive shadows
    this.mesh.receiveShadow = true
  }

  moveWaves () {
    const verts = this.mesh.geometry.vertices
    const l = verts.length

    for (let i = 0; i < l; i++) {
      const v = verts[i]
      const wave = this.waves[i]

      // update the position of the vertex
      v.x = wave.x + Math.cos(wave.ang) * wave.amp
      v.y = wave.y + Math.sin(wave.ang) * wave.amp

      // increment the angle for the next frame
      wave.ang += wave.speed
    }

    // Tell the renderer that the geometry of the sea has changed.
    // In fact, in order to maintain the best level of performance,
    // three.js caches the geometries and ignores any changes
    // unless we add this line
    this.mesh.geometry.verticesNeedUpdate = true
  }
}

export default Sea
