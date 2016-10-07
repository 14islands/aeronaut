import * as THREE from 'three'
import Colors from './colors'

class AirPlane {
  constructor () {
    this.mesh = new THREE.Object3D()

    // Create the cabin
    var geomCockpitTail = new THREE.BoxGeometry(130, 40, 40, 1, 1, 1)
    var matCockpitTail = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading})

    // we can access a specific vertex of a shape through
    // the vertices array, and then move its x, y and z property:
    geomCockpitTail.vertices[4].y -= 10
    geomCockpitTail.vertices[4].z += 20
    geomCockpitTail.vertices[5].y -= 10
    geomCockpitTail.vertices[5].z -= 20
    geomCockpitTail.vertices[6].y += 30
    geomCockpitTail.vertices[6].z += 20
    geomCockpitTail.vertices[7].y += 30
    geomCockpitTail.vertices[7].z -= 20

    var cockpitTail = new THREE.Mesh(geomCockpitTail, matCockpitTail)
    cockpitTail.castShadow = true
    cockpitTail.receiveShadow = true
    cockpitTail.position.set(-75, 0, 0)
    this.mesh.add(cockpitTail)


    var geomCockpit = new THREE.BoxGeometry(40, 40, 40, 1, 1, 1)
    var matCockpit = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading})
    var cockpit = new THREE.Mesh(geomCockpit, matCockpit)
    cockpit.castShadow = true
    cockpit.receiveShadow = true
    cockpit.position.set(10, 0, 0)
    this.mesh.add(cockpit)

    // Create the engine
    var geomEngine = new THREE.BoxGeometry(20, 40, 40, 1, 1, 1)
    var matEngine = new THREE.MeshPhongMaterial({color: Colors.white, shading: THREE.FlatShading})
    var engine = new THREE.Mesh(geomEngine, matEngine)
    engine.position.x = 40
    engine.castShadow = true
    engine.receiveShadow = true
    this.mesh.add(engine)

    // Create top wing
    var geomTopWing = new THREE.BoxGeometry(40, 2, 200, 1, 1, 1)
    var matTopWing = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading, wireframe: true})
    var topWing = new THREE.Mesh(geomTopWing, matTopWing)
    topWing.castShadow = true
    topWing.receiveShadow = true
    topWing.position.set(20, 50, 0)
    this.mesh.add(topWing)

    // Create bottom wing
    var geomBottomWing = new THREE.BoxGeometry(40, 2, 200, 1, 1, 1)
    var matBottomWing = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading})
    var bottomWing = new THREE.Mesh(geomBottomWing, matBottomWing)
    bottomWing.castShadow = true
    bottomWing.receiveShadow = true
    bottomWing.position.set(10, -10, 0)
    this.mesh.add(bottomWing)

    // Wing support 1
    var geomWingSupport = new THREE.BoxGeometry(2, 60, 2, 1, 1, 1)
    var matWingSupport = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading})
    var wingSupportLeft = new THREE.Mesh(geomWingSupport, matWingSupport)
    wingSupportLeft.castShadow = true
    wingSupportLeft.receiveShadow = true
    wingSupportLeft.position.set(15, 20, -80)
    this.mesh.add(wingSupportLeft)
    var wingSupportRight = new THREE.Mesh(geomWingSupport, matWingSupport)
    wingSupportRight.castShadow = true
    wingSupportRight.receiveShadow = true
    wingSupportRight.position.set(15, 20, 80)
    this.mesh.add(wingSupportRight)

    // Create the tail
    var geomTailPlane = new THREE.BoxGeometry(30, 25, 2, 1, 1, 1)
    var matTailPlane = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading})
    var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane)
    tailPlane.position.set(-115, 20, 0)
    tailPlane.castShadow = true
    tailPlane.receiveShadow = true
    this.mesh.add(tailPlane)

    // Create the tail wing
    var geomTailWing = new THREE.BoxGeometry(20, 2, 60, 1, 1, 1)
    var matTailWing = new THREE.MeshPhongMaterial({color: Colors.red, shading: THREE.FlatShading})
    var tailWing = new THREE.Mesh(geomTailWing, matTailWing)
    tailWing.castShadow = true
    tailWing.receiveShadow = true
    tailWing.position.set(-110, 11, 0)
    this.mesh.add(tailWing)


    // propeller
    // var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1)
    // var matPropeller = new THREE.MeshPhongMaterial({color: Colors.brown, shading: THREE.FlatShading})
    // this.propeller = new THREE.Mesh(geomPropeller, matPropeller)
    // this.propeller.castShadow = true
    // this.propeller.receiveShadow = true

    // // blades
    // var geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1)
    // var matBlade = new THREE.MeshPhongMaterial({color: Colors.brownDark, shading: THREE.FlatShading})

    // var blade = new THREE.Mesh(geomBlade, matBlade)
    // blade.position.set(8, 0, 0)
    // blade.castShadow = true
    // blade.receiveShadow = true
    // this.propeller.add(blade)
    // this.propeller.position.set(50, 0, 0)
    // this.mesh.add(this.propeller)

      var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
      geomPropeller.vertices[4].y-=5;
      geomPropeller.vertices[4].z+=5;
      geomPropeller.vertices[5].y-=5;
      geomPropeller.vertices[5].z-=5;
      geomPropeller.vertices[6].y+=5;
      geomPropeller.vertices[6].z+=5;
      geomPropeller.vertices[7].y+=5;
      geomPropeller.vertices[7].z-=5;
      var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
      this.propeller = new THREE.Mesh(geomPropeller, matPropeller);

      this.propeller.castShadow = true;
      this.propeller.receiveShadow = true;

      var geomBlade = new THREE.BoxGeometry(1,80,10,1,1,1);
      var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
      var blade1 = new THREE.Mesh(geomBlade, matBlade);
      blade1.position.set(8,0,0);

      blade1.castShadow = true;
      blade1.receiveShadow = true;

      var blade2 = blade1.clone();
      blade2.rotation.x = Math.PI/2;

      blade2.castShadow = true;
      blade2.receiveShadow = true;

      this.propeller.add(blade1);
      this.propeller.add(blade2);
      this.propeller.position.set(50,0,0);
      this.mesh.add(this.propeller);

    // rotate the geometry on the Y axis away from the camera
    this.mesh.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI / 2))
    this.mesh.rotation.order = 'ZXY'
  }
}

export default AirPlane
