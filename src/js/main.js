import * as THREE from 'three'
import Sky from './sky'
import AirPlane from './airplane'
import Sea from './sea'

// load shimmed plugins - access on THREE namespace
import _VRControls from 'VRControls'
import _VREffect from 'VREffect'
import _ViveController from 'ViveController'

import WebVRManager, {Modes} from 'webvr-boilerplate'

let scene,
  camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
  renderer, container, sea, controls, vrcontrols, sky, airplane, effect, manager, dollyCam, viveController, world

let turnSpeed = 0
let compassHeading = 0

let mouseDragging = false

const clock = new THREE.Clock()

const planeStartY = 200
const planeStartZ = 0
const cameraStartZ = 100

const GROUND_DIAMETER = 2000

function createScene () {
  // Get the width and the height of the screen,
  // use them to set up the aspect ratio of the camera
  // and the size of the renderer.
  HEIGHT = window.innerHeight
  WIDTH = window.innerWidth

  // Create the scene
  scene = new THREE.Scene()

  // Add a fog effect to the scene using similar color as background
  scene.fog = new THREE.Fog(0xc6cceb, 200, GROUND_DIAMETER / 2)

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
}

function handleWindowResize () {
  // update height and width of the renderer and the camera
  HEIGHT = window.innerHeight
  WIDTH = window.innerWidth
  effect.setSize(WIDTH, HEIGHT)
  renderer.setSize(WIDTH, HEIGHT)
  camera.aspect = WIDTH / HEIGHT
  camera.updateProjectionMatrix()
}

function createLights () {
  let hemisphereLight, shadowLight, ambientLight

  // A hemisphere light is a gradient colored light
  // the first parameter is the sky color, the second parameter is the ground color,
  // the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight(0xe8caf4, 0xbbe8f7, 0.5)

  // A directional light shines from a specific direction.
  // It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.1)

  // Set the direction of the light
  shadowLight.position.set(-150, GROUND_DIAMETER, 150)

  // Allow shadow casting
  shadowLight.castShadow = true

  // define the visible area of the projected shadow
  shadowLight.shadow.camera.left = -1000
  shadowLight.shadow.camera.right = 1000
  shadowLight.shadow.camera.top = 1000
  shadowLight.shadow.camera.bottom = -500
  shadowLight.shadow.camera.near = -1000
  shadowLight.shadow.camera.far = 1000
  // debug light
  // scene.add(new THREE.CameraHelper(shadowLight.shadow.camera))

  // define the resolution of the shadow the higher the better,
  // but also the more expensive and less performant
  shadowLight.shadow.mapSize.width = 1024
  shadowLight.shadow.mapSize.height = 1024

  // an ambient light modifies the global color of a scene and makes the shadows softer
  ambientLight = new THREE.AmbientLight(0xe8caf4, 0.7)
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
  // sea.mesh.position.y = -GROUND_DIAMETER
  sea.mesh.rotation.z = Math.PI / 2

  // add the mesh of the sea to the scene
  return sea
}

function createSky () {
  sky = new Sky(GROUND_DIAMETER)
  // sky.mesh.position.y = -GROUND_DIAMETER
  return sky
}

function createPlane () {
  airplane = new AirPlane()
  airplane.mesh.scale.set(0.25, 0.25, 0.25)
  airplane.mesh.position.y = GROUND_DIAMETER + planeStartY
  airplane.mesh.position.z = planeStartZ
  scene.add(airplane.mesh)
}

function updateController (controller, id) {
  controller.update()
  if (controller.visible) {
    // here we are converting the Vive controller position
    // to a normalized value varying between -1 and 1;
    var ty = controller.rotation.x / 0.5
    // var ty = controller.position.y / 0.5
    // var tx = controller.position.x / 0.5
    var tx = (controller.rotation.z + controller.rotation.y) / 0.5 *  -1
    mousePos = {x: tx, y: ty, isInteractive: true}
  }
}

function loop (t) {
  if (viveController) {
    // UPDATE CONTROLLER
    updateController(viveController, 0)
  }

  if (controls) {
    controls.update(clock.getDelta())
  }
  if (vrcontrols) {
    vrcontrols.update(clock.getDelta())
  }

  // update the plane on each frame
  updatePlane()

  // move waves
  sea.moveWaves()

  // Rotate world around Y axis - in direction (heading) we are flying
  const worldHeadingMatrix = new THREE.Matrix4()
  worldHeadingMatrix.makeRotationAxis(new THREE.Vector3(0, 1, 0), turnSpeed)

  // World speed rotation matrix
  const worldSpeedMatrix = new THREE.Matrix4()
  worldSpeedMatrix.makeRotationAxis(new THREE.Vector3(1, 0, 0), 0.002)

  // apply rotation matrixes to current world roation and update
  const newWorldMatrix = new THREE.Matrix4()
  newWorldMatrix.multiply(worldHeadingMatrix)
  newWorldMatrix.multiply(worldSpeedMatrix)
  newWorldMatrix.multiply(world.matrix)
  world.matrix = newWorldMatrix
  world.rotation.setFromRotationMatrix(world.matrix)

  // position camera inside cockpit
  if (manager.mode === Modes.NORMAL || manager.mode === Modes.UNKNOWN) {
    // focus camera on airplane if not in VR mode
    dollyCam.lookAt(airplane.mesh.position)
  } else {
    // Cardboard or VR mode
    const {x, y, z} = airplane.mesh.position
    dollyCam.position.x = x
    dollyCam.lookAt(dollyCam.position)
    dollyCam.position.y = y + 12
    dollyCam.position.z = z + 1
  }

  // Render the scene through the manager.
  manager.render(scene, camera, t)

  // call the loop function again
  window.requestAnimationFrame(loop)
}

function updatePlane () {
  const planeAcceleration = 0.025
  const cameraSpeed = 0.02 // move camera slower than altitude so we see plane dive

  // rotate propeller
  airplane.propeller.rotation.x += 0.3

  // abort flying controll if dragging camera
  if (mouseDragging) return

  const MAX_PITCH = Math.PI / 2
  const MIN_HEIGHT = GROUND_DIAMETER + 20
  const MAX_HEIGHT = GROUND_DIAMETER + 800
  const MAX_DELTA = MAX_HEIGHT - MIN_HEIGHT

  // Modify the plane altitude at each frame by adding a fraction of the remaining distance
  const targetY = normalize(mousePos.y, -0.75, 0.75, MIN_HEIGHT, MAX_HEIGHT) // MIN_HEIGHT should be higher than waves
  const yDelta = targetY - airplane.mesh.position.y
  airplane.mesh.position.y += yDelta * planeAcceleration

  // Pitch the plane proportionally to the remaining distance
  const pitchAngle = MAX_PITCH * normalize(yDelta, -MAX_DELTA / 2, MAX_DELTA / 2, -1, 1)
  airplane.mesh.rotation.x += (pitchAngle - airplane.mesh.rotation.x) * 0.05

  // Roll towards target
  const rollAngle = normalize(mousePos.x, -0.75, 0.75, Math.PI / 4, -Math.PI / 4)
  airplane.mesh.rotation.z = (rollAngle + airplane.mesh.rotation.z) * 0.5

  // Move camera to follow plane
  const cameraY = normalize(mousePos.y, -0.75, 0.75, GROUND_DIAMETER + 40, GROUND_DIAMETER + 850)

  // zoom in close to water - zoom out high up in air
  const cameraZoom = 50
  const cameraZ = normalize(mousePos.y, -0.75, 0.75, cameraStartZ - cameraZoom, cameraStartZ + cameraZoom)

  if (mousePos.isInteractive) {
    dollyCam.position.y += (cameraY - dollyCam.position.y) * cameraSpeed
    dollyCam.position.z += (cameraZ - dollyCam.position.z) * cameraSpeed
  }

  // how fast are we changing compass heading
  turnSpeed = rollAngle * planeAcceleration * -1

  // keep track of current compass heading
  compassHeading += turnSpeed
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

  // world
  world = new THREE.Object3D()
  world.add(sky.mesh)
  world.add(sea.mesh)
  scene.add(world)

  // // Apply VR headset positional data to camera.
  vrcontrols = new THREE.VRControls(camera)

  // Apply VR stereo rendering to renderer.
  effect = new THREE.VREffect(renderer)
  effect.setSize(window.innerWidth, window.innerHeight)

  // Create a VR manager helper to enter and exit VR mode.
  var params = {
    hideButton: false, // Default: false.
    isUndistorted: false // Default: false.
  }
  manager = new WebVRManager(renderer, effect, params)

  // The dolly has to be a PerspectiveCamera, as opposed
  // to a simple Object3D, since that's what
  // OrbitControls expects.
  dollyCam = new THREE.PerspectiveCamera()
  dollyCam.position.y = GROUND_DIAMETER + planeStartY * 2
  dollyCam.position.z = cameraStartZ
  dollyCam.add(camera)
  scene.add(dollyCam)

  // VIVE CONTROLLER
  if (navigator.getGamepads) {
    viveController = new THREE.ViveController(0)
    viveController.standingMatrix = vrcontrols.getStandingMatrix()
    scene.add(viveController)
  }

  // mouse events
  document.addEventListener('mousemove', handleMouseMove, false)
  document.addEventListener('mousedown', handleMouseDown, false)
  document.addEventListener('mouseup', handleMouseUp, false)

  // start a loop that will update the objects' positions
  // and render the scene on each frame
  loop()

  // Listen to the screen: if the user resizes it
  // we have to update the camera and the renderer size
  window.addEventListener('resize', handleWindowResize, false)
}

window.addEventListener('load', init, false)
