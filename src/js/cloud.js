import * as THREE from 'three'
import Colors from './colors'

class Cloud {
  constructor () {
    // Create an empty container that will hold the different parts of the cloud
    this.mesh = new THREE.Object3D()

    // create a cube geometry
    // this shape will be duplicated to create the cloud
    // const geom = new THREE.BoxGeometry(20, 20, 20)
    const geom = new THREE.SphereGeometry(20, 6, 6)

    // create a material a simple white material will do the trick
    const mat = new THREE.MeshPhongMaterial({
      color: Colors.white,
      transparent: true,
      opacity: 0.9,
      shading: THREE.FlatShading
    })

    // duplicate the geometry a random number of times
    const nBlocs = 5 + Math.floor(Math.random() * 20)
    for (let i = 0; i < nBlocs; i++) {
      // create the mesh by cloning the geometry
      const m = new THREE.Mesh(geom, mat)

      // set the position and the rotation of each cube randomly
      m.position.x = i * (15 * Math.random())
      m.position.y = Math.random() * 10
      m.position.z = Math.random() * 20
      m.rotation.z = Math.random() * Math.PI * 2
      m.rotation.y = Math.random() * Math.PI * 2

      // set the size of the cube randomly
      const s = 0.2 + Math.random() * 0.8
      m.scale.set(s, s, s)

      // allow each cube to cast and to receive shadows
      m.castShadow = true
      m.receiveShadow = true

      // add the cube to the container we first created
      this.mesh.add(m)
    }
  }
}

export default Cloud
