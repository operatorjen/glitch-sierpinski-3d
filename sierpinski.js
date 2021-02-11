/* global THREE, Meshline, MeshlineMaterial */
(function () {
  const container = document.querySelector('body')
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)

  THREE.Cache.enabled = true
  
  const opacity = 1.0
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 500 )

  camera.position.x = 200

  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
  scene.add(light)

  var orbit = new THREE.OrbitControls(camera, renderer.domElement)
  orbit.enableZoom = false
  orbit.autoRotate = true

  var green = 0
  var blue = 0
  var angle = 0
  var rSplit
  let tri = ['F','-','G','-','G']
  var countR = 0
  var incr = 10
  var color = 'rgb(55, 255, 255)'
  
  const rules = {
    F: ['F','-','G','+','F','+','G','-','F'],
    G: ['G','G']
  }

  function getNext() {
    if (rules[tri[0]]) {
      tri = tri.concat(rules[tri[0]])
    } else {
      tri = tri.concat(tri[0])
    }
  }

  function init() {
    renderer.autoClearColor = true
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0xffffff, 0)
    renderer.vr.enabled = true
    container.appendChild(renderer.domElement)

    scene.add(camera)
    scene.add(light)
  }

  var tx = 0 
  var ty = 0
  var tz = 0 
  var axisZ = new THREE.Vector3(0, 0, 1)
  var axisY = new THREE.Vector3(0, 1, 0)
  var axisX = new THREE.Vector3(1, 0, 0)

  var startpointZ = new THREE.Vector3(tx, ty, tz)
  var endpointZ = new THREE.Vector3()
  var vector_deltaZ = new THREE.Vector3(incr, incr, 0)

  var startpointX = new THREE.Vector3(tx, ty, tz)
  var endpointX = new THREE.Vector3()
  var vector_deltaX = new THREE.Vector3(0, incr, incr)
  
  var meshZ, meshX, lineZ, lineX

  function plot(t) {
    switch (t) {
      case 'F':
      case 'G':
        blue += 20
        green += 1

        if (blue > 255) {
          blue = 0
        }

        if (green > 215) {
          green = 0
        }

        tx += incr
        ty += incr

        const a = vector_deltaZ.clone().applyAxisAngle(axisZ, angle * (Math.PI / 180))
        const c = vector_deltaX.clone().applyAxisAngle(axisX, -angle * (Math.PI / 180))

        endpointZ.addVectors(startpointZ, a)
        endpointX.addVectors(startpointX, c)

        let geometryZ = new THREE.Geometry()
        geometryZ.vertices.push(startpointZ.clone())
        geometryZ.vertices.push(endpointZ.clone())
  
        let geometryX = new THREE.Geometry()
        geometryX.vertices.push(startpointX.clone())
        geometryX.vertices.push(endpointX.clone())

        lineZ = new MeshLine()
        lineZ.setGeometry(geometryZ, () => {
          return 10 
        })
       
        lineX = new MeshLine()
        lineX.setGeometry(geometryX, (p) => {
          return 10
        })

        const material = new MeshLineMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.3,
          sizeAttenuation: 1
        })

        meshZ = new THREE.Mesh(lineZ.geometry, material)
        scene.add(meshZ)
    
        meshX = new THREE.Mesh(lineX.geometry, material)
        meshX.rotation.z = -60
        scene.add(meshX)

        startpointZ.copy(endpointZ)
        startpointX.copy(endpointX)

        break
      case '-':
        color = 'rgb(10, 150, ' + blue + ')'
        angle -= 120
        break
      case '+':
        color = 'rgb(235, '+ green +', ' + blue + ')'
        angle += 120
        break
    }
  }
  
  function getNext() {
    if (tri.length && tri.length < 6000) {
      if (rules[tri[0]]) {
        tri = tri.concat(rules[tri[0]])
      } else {
        tri = tri.concat(tri[0])
      }
      plot(tri[0])
      tri.shift()
    }
  }

  function render() {
    renderer.render(scene, camera)
    getNext()
    orbit.update()
    window.requestAnimationFrame(render)
  }

  init()
  render()
})()