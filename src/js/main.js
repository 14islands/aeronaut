import * as THREE from 'three'
import OrbitControls from 'three-orbit-controls'
import Colors from './colors'
import Sky from './sky'
import AirPlane from './airplane'
import Sea from './sea'

// window.THREE = THREE
// console.log('w', window.THREE)
// import DeviceOrientationControls from 'device-orientation-controls'

let scene,
  camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
  renderer, container, sea, element, controls, sky, airplane

let mouseDragging = false

const clock = new THREE.Clock()

const planeStartZ = 200

const cameraStartY = 250
const cameraStartZ = 300

const GROUND_DIAMETER = 2000

function createScene () {
  // Get the width and the height of the screen,
  // use them to set up the aspect ratio of the camera
  // and the size of the renderer.
  HEIGHT = window.innerHeight
  WIDTH = window.innerWidth

  // Create the scene
  scene = new THREE.Scene()

  // Add a fog effect to the scene same color as the
  // background color used in the style sheet
  scene.fog = new THREE.Fog(0xc6cceb, 100, 950)
  // scene.fog = new THREE.Fog(0xaae8f7, 100, 950)

  // Create the camera
  aspectRatio = WIDTH / HEIGHT
  fieldOfView = 60
  nearPlane = 1
  farPlane = 10000
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  )

  // Set the position of the camera
  camera.position.x = 0
  camera.position.z = cameraStartZ
  camera.position.y = cameraStartY
  // TEST camera behind plane
  // camera.position.x = -500
  // camera.position.z = 0
  // camera.position.y = 100
  // camera.rotation.y = -Math.PI / 2

  // Create the renderer
  renderer = new THREE.WebGLRenderer({
    // Allow transparency to show the gradient background
    // we defined in the CSS
    alpha: true,
    // Activate the anti-aliasing this is less performant,
    // but, as our project is low-poly based, it should be fine :)
    antialias: true
  })

  // Define the size of the renderer in this case,
  // it will fill the entire screen
  renderer.setSize(WIDTH, HEIGHT)

  // Enable shadow rendering
  renderer.shadowMap.enabled = true

  // Add the DOM element of the renderer to the
  // container we created in the HTML
  container = document.getElementById('world')
  container.appendChild(renderer.domElement)
  element = renderer.domElement

  // Listen to the screen: if the user resizes it
  // we have to update the camera and the renderer size
  window.addEventListener('resize', handleWindowResize, false)
}

function handleWindowResize () {
  // update height and width of the renderer and the camera
  HEIGHT = window.innerHeight
  WIDTH = window.innerWidth
  renderer.setSize(WIDTH, HEIGHT)
  camera.aspect = WIDTH / HEIGHT
  camera.updateProjectionMatrix()
}

function createLights () {
  let hemisphereLight, shadowLight, ambientLight

  // A hemisphere light is a gradient colored light
  // the first parameter is the sky color, the second parameter is the ground color,
  // the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight(0xd8bae4, 0xaae8f7, 0.5)

  // A directional light shines from a specific direction.
  // It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.3)

  // Set the direction of the light
  shadowLight.position.set(150, 350, 150)

  // Allow shadow casting
  shadowLight.castShadow = true

  // define the visible area of the projected shadow
  shadowLight.shadow.camera.left = -1000
  shadowLight.shadow.camera.right = 1000
  shadowLight.shadow.camera.top = 1000
  shadowLight.shadow.camera.bottom = -1000
  shadowLight.shadow.camera.near = -1000
  shadowLight.shadow.camera.far = 1000
  // debug light
  // scene.add(new THREE.CameraHelper(shadowLight.shadow.camera))

  // define the resolution of the shadow the higher the better,
  // but also the more expensive and less performant
  shadowLight.shadow.mapSize.width = 2048
  shadowLight.shadow.mapSize.height = 2048

  // an ambient light modifies the global color of a scene and makes the shadows softer
  ambientLight = new THREE.AmbientLight(0xd8bae4, 0.6)
  // ambientLight = new THREE.AmbientLight(0xaae8f7, 1)
  scene.add(ambientLight)

  // to activate the lights, just add them to the scene
  scene.add(hemisphereLight)
  scene.add(shadowLight)
}

// Instantiate the sea and add it to the scene:
function createSea () {
  sea = new Sea(GROUND_DIAMETER)

  // push it a little bit at the bottom of the scene
  sea.mesh.position.y = -GROUND_DIAMETER
  sea.mesh.rotation.z = Math.PI / 2

  // add the mesh of the sea to the scene
  scene.add(sea.mesh)
}

function createSky () {
  sky = new Sky(GROUND_DIAMETER)
  sky.mesh.position.y = -GROUND_DIAMETER
  scene.add(sky.mesh)
}

function createPlane () {
  airplane = new AirPlane()
  airplane.mesh.scale.set(0.25, 0.25, 0.25)
  airplane.mesh.position.z = planeStartZ
  scene.add(airplane.mesh)
}

function loop (t) {
  if (controls) {
    controls.update(clock.getDelta())
  }

  // Rotate the propeller, the sea and the sky
  sky.mesh.rotation.x += 0.002

  // update the plane on each frame
  updatePlane()

  // move waves
  sea.moveWaves()

  // render the scene
  renderer.render(scene, camera)
  // call the loop function again
  window.requestAnimationFrame(loop)
}

function updatePlane () {

  // rotate propeller
  airplane.propeller.rotation.x += 0.3

  if (mouseDragging) return

  var targetY = normalize(mousePos.y, -0.75, 0.75, 25, 300) // 25 must be higher than waves
  var targetX = normalize(mousePos.x, -0.75, 0.75, -800, 800)

  // Move the plane at each frame by adding a fraction of the remaining distance
  airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1
  airplane.mesh.position.x += (targetX - airplane.mesh.position.x) * 0.1

  // Move camera to follow plane
  var cameraY = normalize(mousePos.y, -0.75, 0.75, 50, 275)
  var cameraX = normalize(mousePos.x, -0.75, 0.75, -825, 825)

  // zoom out at edges of map
  // var cameraZ = normalize(Math.abs(mousePos.x), 0, 0.75, cameraStartZ, cameraStartZ + 100)
  // var cameraZoom = normalize(Math.abs(mousePos.x), 0, 0.75, 50, 60)
  var cameraZoom = 50
  // zoom in close to water - zoom out high up in air
  var cameraZ = normalize(mousePos.y, -0.75, 0.75, cameraStartZ - cameraZoom, cameraStartZ + 100)

  if (mousePos.isInteractive) {
    camera.position.y += (cameraY - camera.position.y) * 0.1
    camera.position.x += (cameraX - camera.position.x) * 0.1
    camera.position.z += (cameraZ - camera.position.z) * 0.1
  }

  // Rotate the plane proportionally to the remaining distance
  // tilt up/down
  airplane.mesh.rotation.x = (targetY - airplane.mesh.position.y) * 0.0128
  // roll
  const rollAngle = (airplane.mesh.position.x - targetX) * 0.0032
  airplane.mesh.rotation.z = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, rollAngle))

  // move controlled camera object
  const {x, y, z} = airplane.mesh.position
  controls.target.set(x, y, z)
}

function normalize (v, vmin, vmax, tmin, tmax) {
  var nv = Math.max(Math.min(v, vmax), vmin)
  var dv = vmax - vmin
  var pc = (nv - vmin) / dv
  var dt = tmax - tmin
  var tv = tmin + (pc * dt)
  return tv
}

let mousePos = {x: 0, y: 0, isInteractive: false}
// now handle the mousemove event
function handleMouseMove (event) {
  // here we are converting the mouse position value received
  // to a normalized value varying between -1 and 1;
  // this is the formula for the horizontal axis:
  var tx = -1 + (event.clientX / WIDTH) * 2

  // for the vertical axis, we need to inverse the formula
  // because the 2D y-axis goes the opposite direction of the 3D y-axis
  var ty = 1 - (event.clientY / HEIGHT) * 2
  mousePos = {x: tx, y: ty, isInteractive: true}
}


function handleMouseDown () {
  mouseDragging = true
}

function handleMouseUp () {
  mouseDragging = false
}


function init () {
  // set up the scene, the camera and the renderer
  createScene()

  // add the lights
  createLights()

  // add the objects
  createPlane()
  createSea()
  createSky()

 function fullscreen() {
    alert('fullscreen')
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    }
  }

  controls = new (OrbitControls(THREE))(camera, element)
  const {x, y, z} = airplane.mesh.position
  controls.target.set(x, y, z)

  // function setOrientationControls(e) {
  //   if (!e.alpha) {
  //     return;
  //   }
  //   controls = new THREE.DeviceOrientationControls(camera, true);
  //   controls.connect();
  //   controls.update();
  //   element.addEventListener('click', fullscreen, false);
  //   window.removeEventListener('deviceorientation', setOrientationControls, true);
  //   alert(element)
  // }
  // window.addEventListener('deviceorientation', setOrientationControls, true);


  // start a loop that will update the objects' positions
  // and render the scene on each frame
  loop()

  //add the listener
  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('mousedown', handleMouseDown, false);
  document.addEventListener('mouseup', handleMouseUp, false);
}

window.addEventListener('load', init, false)