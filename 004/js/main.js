// Generated by CoffeeScript 2.3.1
var RTT, animate, background, camera, clock, container, ctx, current_material, cvs, draw_spot, frag_fluid, generate_planet_texture, init, init_gui, init_materilas, init_planet_texture, init_renderers, init_scene, input, light_1, light_2, light_3, light_mat, materials, materials_cnt, onLoad, onWindowResize, p2u, params, planet, planet_details, planet_radius, planet_resolution, pr_h, pr_w, render, renderer, rnd, rtt, scene, seed, shader_load, shadows_mat, stats, text_load, time, velocities;

onWindowResize = function(event) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  return renderer.setSize(window.innerWidth, window.innerHeight);
};

onLoad = function() {
  init();
  init_gui();
  return animate();
};

input = function(val) {
  var current_material, hash, seed;
  hash = Math.abs(val.hashCode());
  seed = hash;
  current_material = materials[hash % materials_cnt];
  current_material.uniforms.id.value = hash;
  generate_planet_texture();
  velocities.value.needsUpdate = true;
  return planet.material = current_material;
};

window.addEventListener("resize", onWindowResize, false);

window.addEventListener("load", onLoad);

params = {
  background: false
};

init_gui = function() {
  var color_changer, gui, i, j, l, len, light_mat_data, lights_data, n, ref, results, shadows_mat_data, t;
  color_changer = function(c) {
    return function(v) {
      return c.set(v);
    };
  };
  gui = new dat.GUI;
  gui.add(params, 'background').onChange(function() {
    return background.visible = params.background;
  });
  t = gui.addFolder("Shadow mat");
  shadows_mat_data = {
    color: shadows_mat.color.getHex()
  };
  t.addColor(shadows_mat_data, "color").onChange(color_changer(shadows_mat.color));
  t.add(shadows_mat, "metalness", 0.0, 1.0, 0.1); // : 0.0
  t.add(shadows_mat, "roughness", 0.0, 1.0, 0.1); // : 1.0
  t.add(shadows_mat, "opacity", 0.0, 1.0, 0.1); // : 0.61
  t.add(shadows_mat, "transparent"); // : true
  t.add(shadows_mat, "premultipliedAlpha"); // : true
  t = gui.addFolder("Light mat");
  light_mat_data = {
    color: light_mat.color.getHex()
  };
  t.addColor(light_mat_data, "color").onChange(color_changer(light_mat.color));
  t.add(light_mat, "metalness", 0.0, 1.0, 0.1); // : 0.0
  t.add(light_mat, "roughness", 0.0, 1.0, 0.1); // : 1.0
  t.add(light_mat, "opacity", 0.0, 1.0, 0.1); // : 0.61
  t.add(light_mat, "transparent"); // : true
  t.add(light_mat, "premultipliedAlpha"); // : true
  lights_data = {};
  ref = [1, 2, 3].map(function(i) {
    return this[`light_${i}`];
  });
  results = [];
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    l = ref[i];
    n = `${l.type} ${i}`;
    t = gui.addFolder(n);
    t.add(l, "intensity", 0.0, 10.0, 0.1);
    lights_data[n] = {
      color: l.color.getHex()
    };
    results.push(t.addColor(lights_data[n], "color").onChange(color_changer(l.color)));
  }
  return results;
};

container = void 0;

stats = void 0;

camera = void 0;

scene = void 0;

renderer = void 0;

clock = void 0;

planet = void 0;

background = void 0;

rtt = void 0;

shadows_mat = void 0;

light_mat = void 0;

light_1 = void 0;

light_2 = void 0;

light_3 = void 0;

planet_radius = 1.2;

planet_details = 50;

planet_resolution = 256;

pr_w = planet_resolution;

pr_h = planet_resolution;

cvs = void 0;

ctx = void 0;

velocities = void 0;

materials = [];

materials_cnt = 8;

current_material = void 0;

time = {
  value: 1.0
};

seed = 1;

init_materilas = function(vert, frag) {
  var i, j, material, ref, texture, uniforms;
  console.log("Init materials");
  for (i = j = 1, ref = materials_cnt; (1 <= ref ? j <= ref : j >= ref); i = 1 <= ref ? ++j : --j) {
    texture = {
      value: new THREE.TextureLoader().load(`palettes/pal_0${i}.png`)
    };
    texture.value.wrapS = texture.value.wrapT = THREE.RepeatWrapping;
    // Переменные шейдера
    uniforms = {
      id: {
        value: 1.0
      },
      octaves: {
        type: 'i',
        value: params.octaves
      },
      equator: {
        type: 'f',
        value: params.equator
      },
      turbulence: {
        type: 'f',
        value: params.turbulence
      },
      contrast: {
        type: 'f',
        value: params.contrast
      },
      brightness: {
        type: 'f',
        value: params.brightness
      },
      cnt_width: {
        type: 'f',
        value: params.cnt_width
      },
      cnt_alpha: {
        type: 'f',
        value: params.cnt_alpha
      },
      cnt_col1: {
        type: 'v3',
        value: p2u('cnt_col1')
      },
      cnt_col2: {
        type: 'v3',
        value: p2u('cnt_col2')
      },
      cnt_col3: {
        type: 'v3',
        value: p2u('cnt_col3')
      },
      spec_col: {
        type: 'v3',
        value: p2u('spec_col')
      },
      amb_col: {
        type: 'v3',
        value: p2u('amb_col')
      },
      time: time,
      texture: texture,
      velocities: velocities
    };
    material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vert,
      fragmentShader: frag
    });
    materials.push(material);
  }
  return current_material = materials[0];
};

animate = function() {
  requestAnimationFrame(animate);
  render();
  return stats.update();
};

render = function() {
  var delta;
  delta = clock.getDelta();
  time.value = clock.elapsedTime;
  // renderer.setPixelRatio( 1 );
  // renderer.setSize( 256,256 );
  // renderer.autoClear = false;
  // renderer.render rtt.scene, rtt.camera, rtt.texture
  rtt.render(renderer);
  if (planet != null) {
    planet.rotation.y += delta * 0.25;
  }
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  return renderer.render(scene, camera);
};

init_renderers = function() {
  renderer = new THREE.WebGLRenderer({
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  rtt = new RTT;
  container = document.getElementById('container');
  return container.appendChild(renderer.domElement);
};

init_scene = function() {
  var g, light, shadows;
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.z = 4;
  scene = new THREE.Scene;
  clock = new THREE.Clock;
  g = new THREE.PlaneBufferGeometry(5, 2.5, 10);
  background = new THREE.Mesh(g, rtt.mat_screen);
  background.visible = params.background;
  scene.add(background);
  g = new THREE.SphereBufferGeometry(planet_radius, planet_details, planet_details);
  planet = new THREE.Mesh(g, rtt.mat_screen);
  planet.rotation.x = 3.141 / 8.0;
  scene.add(planet);
  g = new THREE.SphereBufferGeometry(planet_radius * 1.001, planet_details, planet_details);
  shadows_mat = new THREE.MeshPhysicalMaterial({
    map: null,
    color: 0xFFFFFF,
    metalness: 0.0,
    roughness: 1.0,
    opacity: 1.0,
    side: THREE.FrontSide,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    blending: THREE.MultiplyBlending
  });
  shadows = new THREE.Mesh(g, shadows_mat);
  scene.add(shadows);
  light_mat = new THREE.MeshPhysicalMaterial({
    color: 0x202020,
    metalness: 0.5,
    roughness: 0.6,
    opacity: 0.5,
    side: THREE.FrontSide,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    blending: THREE.AdditiveBlending
  });
  light = new THREE.Mesh(g, light_mat);
  scene.add(light);
  light_1 = new THREE.PointLight(0xffffD0, 2);
  light_1.position.set(-50, 50, 50);
  scene.add(light_1);
  light_2 = new THREE.PointLight(0x404080, 2);
  light_2.position.set(50, -50, -50);
  scene.add(light_2);
  light_3 = new THREE.PointLight(0x808040, 0.5);
  light_3.position.set(0, -100, 0);
  return scene.add(light_3);
};

init = function() {
  console.log("Init");
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }
  
  // init_planet_texture()
  // generate_planet_texture()
  // velocities = type: 't', value: new THREE.Texture(cvs)
  // velocities.value.wrapS = velocities.value.wrapT = THREE.RepeatWrapping
  // velocities.value.needsUpdate = true
  init_renderers();
  init_scene();
  
  //    shader_load "planet"
  //    .then (shaders)->

  //        init_materilas shaders[0], shaders[1]

  //        g = new THREE.SphereBufferGeometry(planet_radius, planet_details, planet_details)
  //        planet = new THREE.Mesh g, current_material
  //        planet.rotation.x = 3.141 / 8.0
  //        scene.add planet

  //        g = new THREE.PlaneBufferGeometry(5,2.5,10)
  //        background = new THREE.Mesh g, current_material
  //        scene.add background
  stats = new Stats;
  container.appendChild(stats.dom);
  return onWindowResize();
};

frag_fluid = "\nuniform sampler2D bufA; // backbuff\nuniform sampler2D bufB; // velocity\nuniform sampler2D bufC; // textture\nuniform float time;\n\nvarying vec2 vUv;\nvarying vec3 vPos;\nvarying vec3 vNormal;\n\nfloat rand(vec2 n) {\n    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);\n}\n\nfloat rand2(vec2 n) {\n    return 1.0-step(rand(n),0.9);\n}\n\nfloat noise(vec2 n) {\n    const vec2 d = vec2(0.0, 1.0);\n    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));\n    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);\n}\nvec3 overlay(vec3 c1, vec3 c2) {\n    return mix(1.0 - 2.0 * (1.0 - c1) * (1.0 - c2), 2.0 * c1 * c2, step(c1, vec3(0.5)));\n}\n\nvoid main() {\n\n    vec4 c = texture2D(bufC, vUv);\n    vec4 b = texture2D(bufB, vUv);\n    float m = .001;\n    b-=0.5;\n    b*=m;\n    vec2 vel = b.gr*vec2(-1.0, 1.0);\n\n    //vec4 a = texture2D(bufA, vUv);\n    //for(float i=-2.0; i<2.0;i+=0.2) a += (texture2D(bufA, vUv+vel*i)-a)/2.0;\n    vec4 a = texture2D(bufA, vUv+vel);\n    //vec4 a = vec4(overlay(a1.rgb,a2.rgb),1.0);\n    float i = floor(time);\n    float f = fract(time);\n    float k = mix(rand2(vUv+i), rand2(vUv+i+1.0), smoothstep(0.0, 1.0, f));\n    float noise =(rand(vUv+time)-rand(vUv+time+1.0))*0.05;\n    // a*=0.999;\n    gl_FragColor = a*(1.0-k)+c*k+noise;\n    // gl_FragColor = c;\n    // gl_FragColor = vec4(k);\n    if(time <0.5) {\n        gl_FragColor = vec4(c.rgb, 1.0);\n    }\n}";

RTT = (function() {
  class RTT {
    constructor() {
      
      // g = new THREE.SphereBufferGeometry 0.1
      // s = new THREE.Mesh g, new THREE.MeshBasicMaterial({color: 0x808080})
      // @scene.add s

      // @renderer = new THREE.WebGLRenderer
      // @renderer.setSize(@resolution, @resolution);
      // @renderer.setPixelRatio 1.0
      // @renderer.autoClear = false
      this.render = this.render.bind(this);
      this.resolution = 1024;
      this.iteration = 0;
      this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
      this.camera.position.z = 100;
      this.scene = new THREE.Scene;
      this.textureA = new THREE.WebGLRenderTarget(this.resolution, this.resolution, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });
      this.textureB = new THREE.WebGLRenderTarget(this.resolution, this.resolution, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });
      this.bufB = new THREE.TextureLoader().load("textures/jupiter_1024_n.png");
      this.bufB.wrapS = this.bufB.wrapT = THREE.RepeatWrapping;
      this.bufC = new THREE.TextureLoader().load("textures/jupiter_1024.png");
      this.bufC.wrapS = this.bufC.wrapT = THREE.RepeatWrapping;
      this.mat = new THREE.ShaderMaterial({
        uniforms: {
          bufA: {
            type: 't',
            value: this.textureA.texture
          },
          bufB: {
            type: 't',
            value: this.bufB
          },
          bufC: {
            type: 't',
            value: this.bufC
          },
          time: {
            type: 'f',
            value: 0.0
          }
        },
        vertexShader: RTT.vert,
        fragmentShader: RTT.frag,
        depthWrite: false
      });
      this.mat_screen = new THREE.ShaderMaterial({
        uniforms: {
          texture: {
            type: "t",
            value: this.textureA.texture
          }
        },
        vertexShader: RTT.vert,
        fragmentShader: RTT.frag_screen
      });
      this.plane = new THREE.PlaneBufferGeometry(1.0, 1.0);
      this.quad = new THREE.Mesh(this.plane, this.mat);
      this.quad.position.z = -100;
      this.scene.add(this.quad);
    }

    render(renderer) {
      this.mat.uniforms.time.value += 0.1;
      if (this.iteration % 2 === 0) {
        this.mat.uniforms.bufA.value = this.textureB.texture;
        renderer.render(this.scene, this.camera, this.textureA, true);
      } else {
        this.mat.uniforms.bufA.value = this.textureA.texture;
        renderer.render(this.scene, this.camera, this.textureB, true);
      }
      return this.iteration++;
    }

  };

  RTT.vert = "varying vec2 vUv;\nvarying vec3 vPos;\nvarying vec3 vNormal;\nvoid main() {\n    vUv = uv;\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    gl_Position = projectionMatrix * mvPosition; \n    gl_Position     = projectionMatrix * mvPosition;\n    vPos            = vec3(mvPosition)/mvPosition.w;\n    vNormal         = vec3(normalMatrix * normal);\n}";

  RTT.frag = frag_fluid;

  RTT.frag_screen = "varying vec2 vUv;\nvarying vec3 vPos;\nvarying vec3 vNormal;\nuniform sampler2D texture;\nvoid main() {\n    gl_FragColor = texture2D(texture, vUv)*vNormal.z*vNormal.z;\n    gl_FragColor.a = 1.0;\n}";

  return RTT;

}).call(this);

rnd = function(r) {
  var x;
  x = Math.sin(seed++) * 10000;
  return (x - Math.floor(x)) * r;
};

p2u = function(p) {
  return new THREE.Vector3(params[p][0] / 255.0, params[p][1] / 255.0, params[p][2] / 255.0);
};

text_load = function(url) {
  return new Promise(function(resolve, reject) {
    var loader;
    loader = new THREE.XHRLoader(THREE.DefaultLoadingManager);
    loader.setResponseType('text');
    return loader.load(url, resolve, null, reject);
  });
};

shader_load = function(name) {
  console.log(`Load shader ${name}`);
  return Promise.all([text_load(`shaders/${name}.vert`), text_load(`shaders/${name}.frag`)]);
};

String.prototype.hashCode = function() {
  return this.split('').reduce((function(a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }), 0);
};

// Градиент скоростей
init_planet_texture = function() {
  cvs = document.createElement('canvas');
  cvs.id = 'planet_texture';
  ctx = cvs.getContext('2d');
  cvs.width = ctx.width = pr_w;
  return cvs.height = ctx.height = pr_h;
};

// document.body.prepend(cvs);
generate_planet_texture = function() {
  var i;
  var x;
  var y;
  var r;
  var c;
  var c, grd, i, r, results, x, y;
  // Основной фон
  ctx.globalCompositeOperation = 'normal';
  grd = ctx.createLinearGradient(0, 0, 0, pr_h);
  grd.addColorStop(0.0, '#000000');
  grd.addColorStop(0.5, '#202020');
  grd.addColorStop(1.0, '#000000');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, pr_w, pr_h);
  // Пятна
  i = 0;
  while (i < 100) {
    x = rnd(pr_w);
    y = pr_h / 2.0 - rnd(pr_h / 3.0) + rnd(pr_h / 3.0);
    r = 5 + rnd(20);
    c = 50;
    draw_spot(x, y, r, c);
    if (x + r > pr_w) {
      draw_spot(x - pr_w, y, r, c);
    }
    if (x - r < 0) {
      draw_spot(x + pr_w, y, r, c);
    }
    i++;
  }
  i = 0;
  results = [];
  while (i < 4) {
    x = rnd(pr_w);
    y = pr_h / 2.0 - rnd(pr_h / 4.0) + rnd(pr_h / 4.0);
    r = 5 + rnd(40);
    c = 255;
    draw_spot(x, y, r, c);
    if (x + r > pr_w) {
      draw_spot(x - pr_w, y, r, c);
    }
    if (x - r < 0) {
      draw_spot(x + pr_w, y, r, c);
    }
    results.push(i++);
  }
  return results;
};

draw_spot = function(x, y, r, c) {
  var grd;
  grd = ctx.createRadialGradient(x, y, 0, x, y, r);
  grd.addColorStop(0.0, `rgba(${c},${c},${c},1.0 )`);
  grd.addColorStop(0.1, `rgba(${c},${c},${c},0.8 )`);
  grd.addColorStop(0.4, `rgba(${c},${c},${c},0.2 )`);
  grd.addColorStop(0.6, `rgba(${c},${c},${c},0.01)`);
  grd.addColorStop(1.0, `rgba(${c},${c},${c},0.0 )`);
  ctx.globalCompositeOperation = 'screen';
  // Fill with gradient
  ctx.fillStyle = grd;
  return ctx.fillRect(0, 0, pr_w, pr_h);
};
