(function() {
  var CANVAS, EXPORT, LIGHT, MESH, RENDER, SVG, UI, WEBGL, addControls, addEventListeners, animate, attractor, autopilotController, canvasRenderer, center, container, controls, createLights, createMesh, createRenderer, createScene, geometry, gui, initialise, material, mesh, now, onMouseClick, onMouseMove, onWindowResize, output, render, renderer, resize, scene, setRenderer, start, svgRenderer, ui, update, webglRenderer;

  MESH = {
    width: 1.2,
    height: 1.2,
    depth: 20,
    segments: 16,
    slices: 8,
    xRange: 0.8,
    yRange: 0.2,
    zRange: 1.0,
    ambient: "#555555",
    diffuse: "#FFFFFF",
    speed: 0.0005
  };

  LIGHT = {
    count: 2,
    xyScalar: 1,
    zOffset: 100,
    ambient: "#880066",
    diffuse: "#FF8800",
    speed: 0.001,
    gravity: 1200,
    dampening: 0.95,
    minLimit: 10,
    maxLimit: null,
    minDistance: 99,
    maxDistance: 1000,
    autopilot: false,
    draw: false,
    bounds: FSS.Vector3.create(),
    step: FSS.Vector3.create(Math.randomInRange(0.2, 1.0), Math.randomInRange(0.2, 1.0), Math.randomInRange(0.2, 1.0))
  };

  WEBGL = 'webgl';

  CANVAS = 'canvas';

  SVG = 'svg';

  RENDER = {
    renderer: CANVAS
  };

  EXPORT = {
    width: 2000,
    height: 1000,
    drawLights: false,
    minLightX: 0.4,
    maxLightX: 0.6,
    minLightY: 0.2,
    maxLightY: 0.4,
    "export": function() {
      var autopilot, data, depth, j, l, light, ref, scalar, url, x, y, zOffset;
      x = void 0;
      y = void 0;
      light = void 0;
      depth = MESH.depth;
      zOffset = LIGHT.zOffset;
      autopilot = LIGHT.autopilot;
      scalar = this.width / renderer.width;
      LIGHT.autopilot = true;
      LIGHT.draw = this.drawLights;
      LIGHT.zOffset *= scalar;
      MESH.depth *= scalar;
      resize(this.width, this.height);
      for (l = j = ref = scene.lights.length - 1; ref <= 0 ? j <= 0 : j >= 0; l = ref <= 0 ? ++j : --j) {
        light = scene.lights[l];
        x = Math.randomInRange(this.width * this.minLightX, this.width * this.maxLightX);
        y = Math.randomInRange(this.height * this.minLightY, this.height * this.maxLightY);
        FSS.Vector3.set(light.position, x, this.height - y, this.lightZ);
        FSS.Vector3.subtract(light.position, center);
      }
      update();
      render();
      switch (RENDER.renderer) {
        case WEBGL:
          window.open(webglRenderer.element.toDataURL(), '_blank');
          break;
        case CANVAS:
          window.open(canvasRenderer.element.toDataURL(), '_blank');
          break;
        case SVG:
          data = encodeURIComponent(output.innerHTML);
          url = 'data:image/svg+xml,' + data;
          window.open(url, '_blank');
      }
      LIGHT.draw = true;
      LIGHT.autopilot = autopilot;
      LIGHT.zOffset = zOffset;
      MESH.depth = depth;
      return resize(container.offsetWidth, container.offsetHeight);
    }
  };

  UI = {
    show: true
  };

  now = void 0;

  start = Date.now();

  center = FSS.Vector3.create();

  attractor = FSS.Vector3.create();

  container = document.getElementById('container');

  controls = document.getElementById('controls');

  output = document.getElementById('output');

  ui = document.getElementById('ui');

  renderer = void 0;

  scene = void 0;

  mesh = void 0;

  geometry = void 0;

  material = void 0;

  webglRenderer = void 0;

  canvasRenderer = void 0;

  svgRenderer = void 0;

  gui = void 0;

  autopilotController = void 0;

  initialise = function() {
    createRenderer();
    createScene();
    createMesh();
    createLights();
    addEventListeners();
    resize(container.offsetWidth, container.offsetHeight);
    return animate();
  };

  createRenderer = function() {
    webglRenderer = new FSS.WebGLRenderer();
    canvasRenderer = new FSS.CanvasRenderer();
    svgRenderer = new FSS.SVGRenderer();
    return setRenderer(RENDER.renderer);
  };

  setRenderer = function(index) {
    if (renderer) {
      output.removeChild(renderer.element);
    }
    switch (index) {
      case WEBGL:
        renderer = webglRenderer;
        break;
      case CANVAS:
        renderer = canvasRenderer;
        break;
      case SVG:
        renderer = svgRenderer;
    }
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    return output.appendChild(renderer.element);
  };

  createScene = function() {
    return scene = new FSS.Scene();
  };

  createMesh = function() {
    var j, ref, results, v, vertex;
    scene.remove(mesh);
    renderer.clear();
    geometry = new FSS.Plane(MESH.width * renderer.width, MESH.height * renderer.height, MESH.segments, MESH.slices);
    material = new FSS.Material(MESH.ambient, MESH.diffuse);
    mesh = new FSS.Mesh(geometry, material);
    scene.add(mesh);
    vertex = void 0;
    results = [];
    for (v = j = ref = geometry.vertices.length - 1; ref <= 0 ? j <= 0 : j >= 0; v = ref <= 0 ? ++j : --j) {
      vertex = geometry.vertices[v];
      vertex.anchor = FSS.Vector3.clone(vertex.position);
      vertex.step = FSS.Vector3.create(Math.randomInRange(0.2, 1.0), Math.randomInRange(0.2, 1.0), Math.randomInRange(0.2, 1.0));
      results.push(vertex.time = Math.randomInRange(0, Math.PIM2));
    }
    return results;
  };

  createLights = function() {
    var j, k, l, light, ref, ref1, results;
    light = void 0;
    for (l = j = ref = scene.lights.length - 1; ref <= 0 ? j <= 0 : j >= 0; l = ref <= 0 ? ++j : --j) {
      light = scene.lights[l];
      scene.remove(light);
    }
    renderer.clear();
    results = [];
    for (l = k = 0, ref1 = LIGHT.count; 0 <= ref1 ? k < ref1 : k > ref1; l = 0 <= ref1 ? ++k : --k) {
      light = new FSS.Light(LIGHT.ambient, LIGHT.diffuse);
      light.ambientHex = light.ambient.format();
      light.diffuseHex = light.diffuse.format();
      scene.add(light);
      light.mass = Math.randomInRange(0.5, 1);
      light.velocity = FSS.Vector3.create();
      light.acceleration = FSS.Vector3.create();
      light.force = FSS.Vector3.create();
      light.ring = document.createElementNS(FSS.SVGNS, 'circle');
      light.ring.setAttributeNS(null, 'stroke', light.ambientHex);
      light.ring.setAttributeNS(null, 'stroke-width', '0.5');
      light.ring.setAttributeNS(null, 'fill', 'none');
      light.ring.setAttributeNS(null, 'r', '10');
      light.core = document.createElementNS(FSS.SVGNS, 'circle');
      light.core.setAttributeNS(null, 'fill', light.diffuseHex);
      results.push(light.core.setAttributeNS(null, 'r', '4'));
    }
    return results;
  };

  resize = function(width, height) {
    renderer.setSize(width, height);
    FSS.Vector3.set(center, renderer.halfWidth, renderer.halfHeight);
    return createMesh();
  };

  animate = function() {
    now = Date.now() - start;
    update();
    render();
    return requestAnimationFrame(animate);
  };

  update = function() {
    var D, F, j, k, l, light, offset, ox, oy, oz, ref, ref1, v, vertex;
    ox = void 0;
    oy = void 0;
    oz = void 0;
    light = void 0;
    vertex = void 0;
    offset = MESH.depth / 2;
    FSS.Vector3.copy(LIGHT.bounds, center);
    FSS.Vector3.multiplyScalar(LIGHT.bounds, LIGHT.xyScalar);
    FSS.Vector3.setZ(attractor, LIGHT.zOffset);
    if (LIGHT.autopilot) {
      ox = Math.sin(LIGHT.step[0] * now * LIGHT.speed);
      oy = Math.cos(LIGHT.step[1] * now * LIGHT.speed);
      FSS.Vector3.set(attractor, LIGHT.bounds[0] * ox, LIGHT.bounds[1] * oy, LIGHT.zOffset);
    }
    for (l = j = ref = scene.lights.length - 1; ref <= 0 ? j <= 0 : j >= 0; l = ref <= 0 ? ++j : --j) {
      light = scene.lights[l];
      FSS.Vector3.setZ(light.position, LIGHT.zOffset);
      D = Math.clamp(FSS.Vector3.distanceSquared(light.position, attractor), LIGHT.minDistance, LIGHT.maxDistance);
      F = LIGHT.gravity * light.mass / D;
      FSS.Vector3.subtractVectors(light.force, attractor, light.position);
      FSS.Vector3.normalise(light.force);
      FSS.Vector3.multiplyScalar(light.force, F);
      FSS.Vector3.set(light.acceleration);
      FSS.Vector3.add(light.acceleration, light.force);
      FSS.Vector3.add(light.velocity, light.acceleration);
      FSS.Vector3.multiplyScalar(light.velocity, LIGHT.dampening);
      FSS.Vector3.limit(light.velocity, LIGHT.minLimit, LIGHT.maxLimit);
      FSS.Vector3.add(light.position, light.velocity);
    }
    for (v = k = ref1 = geometry.vertices.length - 1; ref1 <= 0 ? k <= 0 : k >= 0; v = ref1 <= 0 ? ++k : --k) {
      vertex = geometry.vertices[v];
      ox = Math.sin(vertex.time + vertex.step[0] * now * MESH.speed);
      oy = Math.cos(vertex.time + vertex.step[1] * now * MESH.speed);
      oz = Math.sin(vertex.time + vertex.step[2] * now * MESH.speed);
      FSS.Vector3.set(vertex.position, MESH.xRange * geometry.segmentWidth * ox, MESH.yRange * geometry.sliceHeight * oy, MESH.zRange * offset * oz - offset);
      FSS.Vector3.add(vertex.position, vertex.anchor);
    }
    return geometry.dirty = true;
  };

  render = function() {
    var j, l, light, lx, ly, ref, results;
    renderer.render(scene);
    if (LIGHT.draw) {
      lx = void 0;
      ly = void 0;
      light = void 0;
      results = [];
      for (l = j = ref = scene.lights.length - 1; ref <= 0 ? j <= 0 : j >= 0; l = ref <= 0 ? ++j : --j) {
        light = scene.lights[l];
        lx = light.position[0];
        ly = light.position[1];
        switch (RENDER.renderer) {
          case CANVAS:
            renderer.context.lineWidth = 0.5;
            renderer.context.beginPath();
            renderer.context.arc(lx, ly, 10, 0, Math.PIM2);
            renderer.context.strokeStyle = light.ambientHex;
            renderer.context.stroke();
            renderer.context.beginPath();
            renderer.context.arc(lx, ly, 4, 0, Math.PIM2);
            renderer.context.fillStyle = light.diffuseHex;
            results.push(renderer.context.fill());
            break;
          case SVG:
            lx += renderer.halfWidth;
            ly = renderer.halfHeight - ly;
            light.core.setAttributeNS(null, 'fill', light.diffuseHex);
            light.core.setAttributeNS(null, 'cx', lx);
            light.core.setAttributeNS(null, 'cy', ly);
            renderer.element.appendChild(light.core);
            light.ring.setAttributeNS(null, 'stroke', light.ambientHex);
            light.ring.setAttributeNS(null, 'cx', lx);
            light.ring.setAttributeNS(null, 'cy', ly);
            results.push(renderer.element.appendChild(light.ring));
            break;
          default:
            results.push(void 0);
        }
      }
      return results;
    }
  };

  addEventListeners = function() {
    window.addEventListener('resize', onWindowResize);
    container.addEventListener('click', onMouseClick);
    return container.addEventListener('mousemove', onMouseMove);
  };

  addControls = function() {
    var controller, exportFolder, folder, light, lightFolder, meshFolder, renderFolder, uiFolder;
    light = void 0;
    folder = void 0;
    controller = void 0;
    gui = new dat.GUI({
      autoPlace: false
    });
    controls.appendChild(gui.domElement);
    uiFolder = gui.addFolder('UI');
    renderFolder = gui.addFolder('Render');
    meshFolder = gui.addFolder('Mesh');
    lightFolder = gui.addFolder('Light');
    exportFolder = gui.addFolder('Export');
    uiFolder.open();
    renderFolder.open();
    lightFolder.open();
    controller = uiFolder.add(UI, 'show');
    controller.onChange(function(value) {
      return ui.className = (value ? 'wrapper' : 'wrapper hide');
    });
    controller = renderFolder.add(RENDER, 'renderer', {
      webgl: WEBGL,
      canvas: CANVAS,
      svg: SVG
    });
    controller.onChange(function(value) {
      return setRenderer(value);
    });
    controller = meshFolder.addColor(MESH, 'ambient');
    controller.onChange(function(value) {
      var i, j, ref, results;
      results = [];
      for (i = j = 0, ref = scene.meshes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(scene.meshes[i].material.ambient.set(value));
      }
      return results;
    });
    controller = meshFolder.addColor(MESH, 'diffuse');
    controller.onChange(function(value) {
      var i, j, ref, results;
      results = [];
      for (i = j = 0, ref = scene.meshes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(scene.meshes[i].material.diffuse.set(value));
      }
      return results;
    });
    controller = meshFolder.add(MESH, 'width', 0.05, 2);
    controller.onChange(function(value) {
      if (geometry.width !== value * renderer.width) {
        return createMesh();
      }
    });
    controller = meshFolder.add(MESH, 'height', 0.05, 2);
    controller.onChange(function(value) {
      if (geometry.height !== value * renderer.height) {
        return createMesh();
      }
    });
    controller = meshFolder.add(MESH, 'depth', 0, 50);
    controller = meshFolder.add(MESH, 'segments', 1, 20);
    controller.step(1);
    controller.onChange(function(value) {
      if (geometry.segments !== value) {
        return createMesh();
      }
    });
    controller = meshFolder.add(MESH, 'slices', 1, 20);
    controller.step(1);
    controller.onChange(function(value) {
      if (geometry.slices !== value) {
        return createMesh();
      }
    });
    controller = meshFolder.add(MESH, 'xRange', 0, 1);
    controller = meshFolder.add(MESH, 'yRange', 0, 1);
    controller = meshFolder.add(MESH, 'speed', 0, 0.01);
    autopilotController = lightFolder.add(LIGHT, 'autopilot');
    controller = lightFolder.addColor(LIGHT, 'ambient');
    controller.onChange(function(value) {
      var i, j, ref, results;
      results = [];
      for (i = j = 0, ref = scene.lights.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        light = scene.lights[i];
        light.ambient.set(value);
        results.push(light.ambientHex = light.ambient.format());
      }
      return results;
    });
    controller = lightFolder.addColor(LIGHT, 'diffuse');
    controller.onChange(function(value) {
      var i, j, ref, results;
      results = [];
      for (i = j = 0, ref = scene.lights.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        light = scene.lights[i];
        light.diffuse.set(value);
        results.push(light.diffuseHex = light.diffuse.format());
      }
      return results;
    });
    controller = lightFolder.add(LIGHT, 'count', 0, 5);
    controller.step(1);
    controller.onChange(function(value) {
      if (scene.lights.length !== value) {
        return createLights();
      }
    });
    controller = lightFolder.add(LIGHT, 'zOffset', 0, 500);
    controller.step(1);
    controller = exportFolder.add(EXPORT, 'width', 100, 4000);
    controller.step(100);
    controller = exportFolder.add(EXPORT, 'height', 100, 4000);
    controller.step(100);
    controller = exportFolder.add(EXPORT, 'drawLights');
    controller = exportFolder.add(EXPORT, 'minLightX', 0, 1);
    controller = exportFolder.add(EXPORT, 'maxLightX', 0, 1);
    controller = exportFolder.add(EXPORT, 'minLightY', 0, 1);
    controller = exportFolder.add(EXPORT, 'maxLightY', 0, 1);
    return controller = exportFolder.add(EXPORT, 'export');
  };

  onMouseClick = function(event) {
    FSS.Vector3.set(attractor, event.x, renderer.height - event.y);
    FSS.Vector3.subtract(attractor, center);
    LIGHT.autopilot = !LIGHT.autopilot;
    return autopilotController.updateDisplay();
  };

  onMouseMove = function(event) {
    FSS.Vector3.set(attractor, event.x, renderer.height - event.y);
    return FSS.Vector3.subtract(attractor, center);
  };

  onWindowResize = function(event) {
    resize(container.offsetWidth, container.offsetHeight);
    return render();
  };

  initialise();

}).call(this);