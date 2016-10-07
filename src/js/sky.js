import * as THREE from 'three'
import Cloud from './cloud'

class Sky {
  constructor (GROUND_DIAMETER) {
    // Create an empty container
    this.mesh = new THREE.Object3D()

    // choose a number of clouds to be scattered in the sky
    this.nClouds = 100

    // To distribute the clouds consistently,
    // we need to place them according to a uniform angle
    var stepAngle = Math.PI * 2 / this.nClouds

    // create the clouds
    for (let i = 0; i < this.nClouds; i++) {
      const c = new Cloud()

      // set the rotation and the position of each cloud
      // for that we use a bit of trigonometry
      const a = stepAngle * i // this is the final angle of the cloud
      const h = GROUND_DIAMETER + 150 + Math.random() * 300 // this is the distance between the center of the axis and the cloud itself

      // Trigonometry!!! I hope you remember what you've learned in Math :)
      // in case you don't:
      // we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
      c.mesh.position.y = Math.sin(a) * h
      c.mesh.position.z = Math.cos(a) * h

      // rotate the cloud according to its position
      c.mesh.rotation.x = a + Math.PI / 2

      // for a better result, we position the clouds
      // at random depths inside of the scene
      c.mesh.position.x = -1000 + Math.random() * 2000

      // we also set a random scale for each cloud
      const s = 1 + Math.random() * 2
      c.mesh.scale.set(s, s, s)

      // do not forget to add the mesh of each cloud in the scene
      this.mesh.add(c.mesh)
    }
  }
}

export default Sky
