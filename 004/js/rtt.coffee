frag_fluid = """

uniform sampler2D bufA; // backbuff
uniform sampler2D bufB; // velocity
uniform sampler2D bufC; // textture
uniform float time;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float rand2(vec2 n) {
    return 1.0-step(rand(n),0.9);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}
vec3 overlay(vec3 c1, vec3 c2) {
    return mix(1.0 - 2.0 * (1.0 - c1) * (1.0 - c2), 2.0 * c1 * c2, step(c1, vec3(0.5)));
}

void main() {

    vec4 c = texture2D(bufC, vUv);
    vec4 b = texture2D(bufB, vUv);
    float m = .001;
    b-=0.5;
    b*=m;
    vec2 vel = b.gr*vec2(-1.0, 1.0);

    //vec4 a = texture2D(bufA, vUv);
    //for(float i=-2.0; i<2.0;i+=0.2) a += (texture2D(bufA, vUv+vel*i)-a)/2.0;
    vec4 a = texture2D(bufA, vUv+vel);
    //vec4 a = vec4(overlay(a1.rgb,a2.rgb),1.0);
    float i = floor(time);
    float f = fract(time);
    float k = mix(rand2(vUv+i), rand2(vUv+i+1.0), smoothstep(0.0, 1.0, f));
    float noise =(rand(vUv+time)-rand(vUv+time+1.0))*0.05;
    // a*=0.999;
    gl_FragColor = a*(1.0-k)+c*k+noise;
    // gl_FragColor = c;
    // gl_FragColor = vec4(k);
    if(time <0.5) {
        gl_FragColor = vec4(c.rgb, 1.0);
    }
}
"""

class RTT

    @vert: """
        varying vec2 vUv;
        varying vec3 vPos;
        varying vec3 vNormal;
        void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_Position = projectionMatrix * mvPosition; 
            gl_Position     = projectionMatrix * mvPosition;
            vPos            = vec3(mvPosition)/mvPosition.w;
            vNormal         = vec3(normalMatrix * normal);
        }"""
        
    @frag: frag_fluid

    @frag_screen: """
        varying vec2 vUv;
        varying vec3 vPos;
        varying vec3 vNormal;
        uniform sampler2D texture;
        void main() {
            gl_FragColor = texture2D(texture, vUv)*vNormal.z*vNormal.z;
            gl_FragColor.a = 1.0;
        }"""
        
    constructor: ->

        @resolution = 1024;
        @iteration  = 0

        @camera = new THREE.OrthographicCamera(
            -0.5, 0.5, 0.5,-0.5,
            -10000, 10000)
            
        @camera.position.z = 100
        @scene = new THREE.Scene

        @textureA = new THREE.WebGLRenderTarget(@resolution, @resolution,
            minFilter: THREE.LinearFilter
            magFilter: THREE.LinearFilter
            format: THREE.RGBAFormat)

        @textureB = new THREE.WebGLRenderTarget(@resolution, @resolution,
            minFilter: THREE.LinearFilter
            magFilter: THREE.LinearFilter
            format: THREE.RGBAFormat)

        @bufB = new THREE.TextureLoader().load("textures/jupiter_1024_n.png")
        @bufB.wrapS = @bufB.wrapT = THREE.RepeatWrapping
        @bufC = new THREE.TextureLoader().load("textures/jupiter_1024.png")
        @bufC.wrapS = @bufC.wrapT = THREE.RepeatWrapping
        
        @mat = new THREE.ShaderMaterial
            uniforms:
                bufA: type: 't',value: @textureA.texture
                bufB: type: 't',value: @bufB
                bufC: type: 't',value: @bufC
                time: type: 'f',value: 0.0
            vertexShader  : RTT.vert
            fragmentShader: RTT.frag
            depthWrite    : false

        @mat_screen = new THREE.ShaderMaterial
            uniforms:
                texture:
                    type : "t"
                    value: @textureA.texture
            vertexShader  : RTT.vert
            fragmentShader: RTT.frag_screen

        @plane = new THREE.PlaneBufferGeometry 1.0, 1.0
        @quad  = new THREE.Mesh @plane, @mat
        
        @quad.position.z = -100
        @scene.add @quad
        
        # g = new THREE.SphereBufferGeometry 0.1
        # s = new THREE.Mesh g, new THREE.MeshBasicMaterial({color: 0x808080})
        # @scene.add s
        
        # @renderer = new THREE.WebGLRenderer
        # @renderer.setSize(@resolution, @resolution);
        # @renderer.setPixelRatio 1.0
        # @renderer.autoClear = false
        
    render:(renderer) =>
        @mat.uniforms.time.value += 0.1
       
        if @iteration%2 is 0
            @mat.uniforms.bufA.value = @textureB.texture
            renderer.render @scene, @camera, @textureA, true
        else
            @mat.uniforms.bufA.value = @textureA.texture
            renderer.render @scene, @camera, @textureB, true
        @iteration++
