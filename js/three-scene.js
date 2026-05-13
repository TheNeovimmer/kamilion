(function () {
  if (typeof THREE === "undefined") return;

  var container = document.getElementById("three-bg");
  if (!container) return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  var mouseX = 0,
    mouseY = 0;
  var targetRotX = 0,
    targetRotY = 0;
  var scrollY = 0;
  var time = 0;
  var isDark = document.documentElement.classList.contains("dark");

  var group = new THREE.Group();
  scene.add(group);

  var palette = {
    dark: { primary: 0xcfbcff, secondary: 0x6750a4, tertiary: 0xe7c365, accent: 0xcdc0e9 },
    light: { primary: 0x6750a4, secondary: 0xcfbcff, tertiary: 0xb8860b, accent: 0x9c8eb5 }
  };

  var colors = [0xcfbcff, 0x6750a4, 0xe7c365, 0xcdc0e9];
  var count = 18;
  var meshes = [];

  for (var i = 0; i < count; i++) {
    var t = i / count;
    var angle = t * Math.PI * 6;
    var radius = 3 + t * 4;
    var height = (t - 0.5) * 12;

    var geo;
    var r = Math.random();
    if (r < 0.3) geo = new THREE.TorusKnotGeometry(0.25 + Math.random() * 0.25, 0.08, 48, 6);
    else if (r < 0.6) geo = new THREE.OctahedronGeometry(0.25 + Math.random() * 0.35);
    else if (r < 0.8) geo = new THREE.IcosahedronGeometry(0.25 + Math.random() * 0.35);
    else geo = new THREE.TorusGeometry(0.3 + Math.random() * 0.2, 0.08, 24, 32);

    var color = colors[Math.floor(Math.random() * colors.length)];
    var mat = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.3,
      transparent: true,
      opacity: 0.6 + Math.random() * 0.3,
      emissive: color,
      emissiveIntensity: 0.08 + Math.random() * 0.1,
      clearcoat: 0.2,
      clearcoatRoughness: 0.4,
    });

    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );

    var scale = 0.8 + Math.random() * 0.6;
    mesh.scale.set(scale, scale, scale);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mesh.userData = {
      origPos: mesh.position.clone(),
      rotSpeed: { x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.008, z: (Math.random() - 0.5) * 0.005 },
      floatSpeed: 0.3 + Math.random() * 0.5,
      floatAmp: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      color: color,
    };
    group.add(mesh);
    meshes.push(mesh);
  }

  var particleCount = 2000;
  var particleGeo = new THREE.BufferGeometry();
  var posArray = new Float32Array(particleCount * 3);
  var sizeArray = new Float32Array(particleCount);
  var colorArray = new Float32Array(particleCount * 3);
  var particleSpeeds = [];

  for (var i = 0; i < particleCount; i++) {
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    var r = 5 + Math.random() * 15;
    posArray[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    posArray[i * 3 + 1] = (Math.random() - 0.5) * 18;
    posArray[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    sizeArray[i] = 0.02 + Math.random() * 0.08;

    var pc = colors[Math.floor(Math.random() * colors.length)];
    var pr = ((pc >> 16) & 255) / 255;
    var pg = ((pc >> 8) & 255) / 255;
    var pb = (pc & 255) / 255;
    colorArray[i * 3] = pr;
    colorArray[i * 3 + 1] = pg;
    colorArray[i * 3 + 2] = pb;
    particleSpeeds.push({
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.002,
      z: (Math.random() - 0.5) * 0.002,
      phase: Math.random() * Math.PI * 2,
      floatAmp: 0.2 + Math.random() * 0.5,
    });
  }

  particleGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
  particleGeo.setAttribute("size", new THREE.BufferAttribute(sizeArray, 1));
  particleGeo.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

  var particleMat = new THREE.PointsMaterial({
    size: 0.05,
    transparent: true,
    opacity: 0.6,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false,
  });
  var particles = new THREE.Points(particleGeo, particleMat);
  group.add(particles);
  var particlePositions = particles.geometry.attributes.position.array;

  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xcfbcff,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
  });

  function updateConnections() {
    var positions = [];
    var threshold = 5;
    for (var i = 0; i < meshes.length; i++) {
      for (var j = i + 1; j < meshes.length; j++) {
        var dx = meshes[i].position.x - meshes[j].position.x;
        var dy = meshes[i].position.y - meshes[j].position.y;
        var dz = meshes[i].position.z - meshes[j].position.z;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < threshold) {
          positions.push(meshes[i].position.x, meshes[i].position.y, meshes[i].position.z);
          positions.push(meshes[j].position.x, meshes[j].position.y, meshes[j].position.z);
        }
      }
    }

    if (group.children[group.children.length - 1] && group.children[group.children.length - 1].isLineSegments) {
      group.remove(group.children[group.children.length - 1]);
    }

    if (positions.length > 0) {
      var lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      var lines = new THREE.LineSegments(lineGeo, lineMaterial);
      lines.frustumCulled = false;
      group.add(lines);
    }
  }

  camera.position.z = 10;
  camera.position.y = 1;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    targetRotX += (mouseY * 0.003 - targetRotX) * 0.04;
    targetRotY += (mouseX * 0.003 - targetRotY) * 0.04;

    var breathe = Math.sin(time * 0.3) * 0.15;
    camera.position.z = 10 + breathe;
    camera.lookAt(0, 0, 0);

    group.rotation.x = targetRotX + Math.sin(time * 0.15) * 0.02;
    group.rotation.y = targetRotY + Math.sin(time * 0.1) * 0.03;

    meshes.forEach(function (m, i) {
      var ud = m.userData;
      m.rotation.x += ud.rotSpeed.x;
      m.rotation.y += ud.rotSpeed.y;
      m.rotation.z += ud.rotSpeed.z;
      var floatOffset = Math.sin(time * ud.floatSpeed + ud.phase) * ud.floatAmp;
      m.position.y = ud.origPos.y + floatOffset + Math.sin(time * 0.2 + i) * 0.1;
    });

    for (var i = 0; i < particleCount; i++) {
      var ps = particleSpeeds[i];
      particlePositions[i * 3] += ps.x + Math.sin(time * 0.1 + ps.phase) * 0.0005;
      particlePositions[i * 3 + 1] += ps.y + Math.sin(time * 0.08 + ps.phase) * 0.001;
      particlePositions[i * 3 + 2] += ps.z + Math.cos(time * 0.12 + ps.phase) * 0.0005;

      if (Math.abs(particlePositions[i * 3]) > 18) particlePositions[i * 3] *= -0.9;
      if (Math.abs(particlePositions[i * 3 + 1]) > 12) particlePositions[i * 3 + 1] *= -0.9;
      if (Math.abs(particlePositions[i * 3 + 2]) > 18) particlePositions[i * 3 + 2] *= -0.9;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    updateConnections();

    renderer.render(scene, camera);
  }

  animate();

  document.addEventListener("mousemove", function (e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  window.addEventListener("scroll", function () {
    scrollY = window.scrollY;
    var rotBoost = Math.min(scrollY / 1000, 0.5);
    targetRotY += rotBoost * 0.0001;
  });

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  var themeObserver = new MutationObserver(function () {
    var nowDark = document.documentElement.classList.contains("dark");
    if (nowDark !== isDark) {
      isDark = nowDark;
      var p = isDark ? palette.dark : palette.light;
      meshes.forEach(function (m) {
        m.material.color.setHex(p.primary);
        m.material.emissive.setHex(p.primary);
      });
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
})();
