// Generated by CoffeeScript 2.3.1
var RTT, animate, background, camera, clock, container, ctx, current_material, cvs, draw_spot, frag_fluid, generate_planet_texture, init, init_gui, init_materilas, init_planet_texture, init_renderers, init_scene, input, light_1, light_2, light_3, light_mat, materials, materials_cnt, noise_frag, onLoad, onWindowResize, p2u, params, planet, planet_details, planet_radius, planet_resolution, pr_h, pr_w, redefines, render, renderer, rnd, rtt, scene, seed, shader_load, shadows_mat, stats, text_load, time, velocities;

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
  var color_changer, data, gui, i, j, l, len, light_mat_data, lights_data, n, ref, results, shadows_mat_data, t;
  color_changer = function(c) {
    return function(v) {
      return c.set(v);
    };
  };
  data = {
    palette: 1
  };
  gui = new dat.GUI;
  gui.add(params, 'background').onChange(function() {
    return background.visible = params.background;
  });
  gui.add(data, "palette", [1, 2, 3, 4, 5, 6, 7, 8]).onChange(function(v) {
    return rtt.set_palette(v - 1);
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

redefines = "#define iChannel0 bufA\n#define iChannel1 bufB\n#define iChannel2 bufC\n#define texture texture2D\n\n#define Res  vec3(512.0)\n#define Res1 vec3(512.0)\n\nuniform sampler2D bufA;\nuniform sampler2D bufB;\nuniform sampler2D bufC;\nuniform float time;\n";

frag_fluid = `\n${redefines}\n\n#define RotNum 5\n#define angRnd 1.0\n#define posRnd 0.0\n\nconst float ang = 2.0*3.1415926535/float(RotNum);\nmat2 m = mat2(cos(ang),sin(ang),-sin(ang),cos(ang));\n\nfloat hash(float seed) { return fract(sin(seed)*158.5453 ); }\nvec4 getRand4(float seed) { return vec4(hash(seed),hash(seed+123.21),hash(seed+234.32),hash(seed+453.54)); }\nvec4 randS(vec2 uv) {\n    //return getRand4(uv.y+uv.x*1234.567)-vec4(0.5);\n    return texture(iChannel1,uv*Res.xy/Res1.xy)-vec4(0.5);\n}\n\nfloat getRot(vec2 uv, float sc)\n{\n    float ang2 = angRnd*randS(uv).x*ang;\n    vec2 p = vec2(cos(ang2),sin(ang2));\n    float rot=0.0;\n    for(int i=0;i<RotNum;i++)\n    {\n        vec2 p2 = (p+posRnd*randS(uv+p*sc).xy)*sc;\n        vec2 v = texture(iChannel0,fract(uv+p2)).xy-vec2(0.5);\n        rot+=cross(vec3(v,0.0),vec3(p2,0.0)).z/dot(p2,p2);\n        p = m*p;\n    }\n    rot/=float(RotNum);\n    return rot;\n}\n\nvoid init( out vec4 fragColor, in vec4 fragCoord ) {\n    vec2 uv = fragCoord.xy / Res.xy;\n    fragColor = texture(iChannel2,uv);\n}\n\nvoid main() {\n    vec2 uv = gl_FragCoord.xy / Res.xy;\n    vec2 scr=uv*2.0-vec2(1.0);\n    \n    float sc=1.0/max(Res.x,Res.y);\n    vec2 v=vec2(0);\n    for(int level=0;level<20;level++) {\n        if ( sc > 0.7 ) break;\n        float ang2 = angRnd*ang*randS(uv).y;\n        vec2 p = vec2(cos(ang2),sin(ang2));\n        for(int i=0;i<RotNum;i++) {\n            vec2 p2=p*sc;\n            float rot=getRot(uv+p2,sc);\n            //v+=cross(vec3(0,0,rot),vec3(p2,0.0)).xy;\n            v+=p2.yx*rot*vec2(-1,1); //maybe faster than above\n            p = m*p;\n        }\n        sc*=2.0;\n    }\n       \n    gl_FragColor=texture(iChannel0, fract(uv+v*3.0/Res.x));\n\n    //float k = 0.01;\n    //gl_FragColor=(1.0-k)*gl_FragColor + k*texture(iChannel1, gl_FragCoord.xy/512.0);\n    \n    // add a little "motor" in the center\n    gl_FragColor.xy += (0.01*scr.xy / (dot(scr,scr)/0.1+0.3));\n    \n    if(time<=1.0) init(gl_FragColor, gl_FragCoord);\n}`;

noise_frag = "float rand(vec2 n) { \n    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);\n}\n\nfloat noise(vec2 p){\n    vec2 ip = floor(p);\n    vec2 u = fract(p);\n    u = u*u*(3.0-2.0*u);\n\n    float res = mix(\n        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),\n        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);\n    return res*res;\n}";

RTT = (function() {
  class RTT {
    constructor() {
      var j, noise, p, palette;
      
      // g = new THREE.SphereBufferGeometry 0.1
      // s = new THREE.Mesh g, new THREE.MeshBasicMaterial({color: 0x808080})
      // @scene.add s

      // @renderer = new THREE.WebGLRenderer
      // @renderer.setSize(@resolution, @resolution);
      // @renderer.setPixelRatio 1.0
      // @renderer.autoClear = false
      this.render = this.render.bind(this);
      this.set_palette = this.set_palette.bind(this);
      this.resolution = 512;
      this.iteration = 0;
      this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
      this.camera.position.z = 100;
      this.scene = new THREE.Scene;
      this.textureA = new THREE.WebGLRenderTarget(this.resolution, this.resolution, {
        minFilter: THREE.LinearFilter,
        //magFilter: THREE.NearestFilter
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });
      this.textureB = new THREE.WebGLRenderTarget(this.resolution, this.resolution, {
        minFilter: THREE.LinearFilter,
        //magFilter: THREE.NearestFilter
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });
      noise = new THREE.TextureLoader().load("palettes/velocity.png");
      noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
      this.palettes = [];
      for (p = j = 1; j <= 8; p = ++j) {
        palette = new THREE.TextureLoader().load(`palettes/pal_0${p}.png`);
        palette.wrapS = palette.wrapT = THREE.RepeatWrapping;
        this.palettes.push(palette);
      }
      this.mat = new THREE.ShaderMaterial({
        uniforms: {
          bufA: {
            type: 't',
            value: this.textureA.texture
          },
          bufB: {
            type: 't',
            value: noise
          },
          bufC: {
            type: 't',
            value: noise
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
          },
          palette: {
            type: "t",
            value: this.palettes[0]
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

    set_palette(p) {
      return this.mat_screen.uniforms.palette.value = this.palettes[p];
    }

  };

  RTT.vert = "varying vec2 vUv;\nvarying vec3 vPos;\nvarying vec3 vNormal;\nvoid main() {\n    vUv = uv;\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    gl_Position = projectionMatrix * mvPosition; \n	gl_Position     = projectionMatrix * mvPosition;\n	vPos            = vec3(mvPosition)/mvPosition.w;\n	vNormal         = vec3(normalMatrix * normal);\n}";

  RTT.frag = frag_fluid;

  RTT.frag_screen = "varying vec2 vUv;\nvarying vec3 vPos;\nvarying vec3 vNormal;\nuniform sampler2D texture;\nuniform sampler2D palette;\n\nvoid main() {\n    vec4 uv = texture2D(texture, vUv);\n    vec4 c1 = texture2D(palette, uv.gb*4.0)*vNormal.z*vNormal.z;\n    gl_FragColor = vec4(c1.rgb, 1.0);\n}";

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
