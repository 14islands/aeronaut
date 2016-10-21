import * as THREE from 'three'
import Cloud from './cloud'

class Sky {
  constructor (GROUND_DIAMETER) {
    // Create an empty container
    this.mesh = new THREE.Object3D()

    // choose a number of clouds to be scattered in the sky
    this.nClouds = 200

    // To distribute the clouds consistently,
    // we need to place them according to a uniform angle
    var stepAngle = Math.PI * 2 / this.nClouds

    // create the clouds
    for (let i = 0; i < this.nClouds; i++) {
      const c = new Cloud()

      // Get random altitude of cloud - radius is the distance from the center of the world
      const radius = GROUND_DIAMETER + 150 + Math.random() * 300

      // Step through the Polar angle Theta around X-axis to spread clouds evenly
      const theta = stepAngle * i

      // Random azimuthal angle Phi around Z-axis to spread clouds across all of the sphere
      const phi = Math.random() * Math.PI * 2

      // generate random angle of cloud facing airplane
      const rotY = Math.random() * Math.PI * 2

      // Rotate and translate to desired height above sphere surface
      const cloudMatrix = c.mesh.matrix.clone()

      const rotateMatrixX = new THREE.Matrix4()
      rotateMatrixX.makeRotationX(theta)

      const rotateMatrixZ = new THREE.Matrix4()
      rotateMatrixZ.makeRotationZ(phi)

      const rotateMatrixY = new THREE.Matrix4()
      rotateMatrixY.makeRotationY(rotY)

      const translateMatrix = new THREE.Matrix4()
      translateMatrix.makeTranslation(0, radius, 0)

      cloudMatrix.multiply(rotateMatrixX)
      cloudMatrix.multiply(rotateMatrixZ)
      cloudMatrix.multiply(translateMatrix)
      cloudMatrix.multiply(rotateMatrixY)
      c.mesh.applyMatrix(cloudMatrix)

      // we also set a random scale for each cloud
      const s = 1 + Math.random() * 2
      c.mesh.scale.set(s, s, s)

      // do not forget to add the mesh of each cloud in the scene
      this.mesh.add(c.mesh)
    }
  }
}

export default Sky
