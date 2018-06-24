uniform sampler2D bufA; // backbuff
uniform sampler2D bufB; // velocity
uniform sampler2D bufC; // texture
uniform float time;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float rand2(vec2 n, float k) {
    return step(rand(n), k);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}
vec3 overlay(vec3 c1, vec3 c2) {
    return mix(1.0 - 2.0 * (1.0 - c1) * (1.0 - c2), 2.0 * c1 * c2, step(c1, vec3(0.5)));
}

vec4 sharp(in sampler2D txt, in vec2 pos) {
    vec4 sum = texture2D(txt, pos+vec2(-1, -1)) * -1.
             + texture2D(txt, pos+vec2(-1,  0)) * -1.
             + texture2D(txt, pos+vec2(-1,  1)) * -1.
             + texture2D(txt, pos+vec2( 0, -1)) * -1.
             + texture2D(txt, pos+vec2( 0,  0)) *  9.
             + texture2D(txt, pos+vec2( 0,  1)) * -1.
             + texture2D(txt, pos+vec2( 1, -1)) * -1.
             + texture2D(txt, pos+vec2( 1,  0)) * -1.
             + texture2D(txt, pos+vec2( 1,  1)) * -1.; 
    return sum;
}

vec4 sharpv(in sampler2D txt, in vec2 pos, vec2 vel) {
    vec4 sum = 
               texture2D(txt, pos                  ) *  1.
             //+ texture2D(txt, pos+vel.xy           ) *  1.
             //+ texture2D(txt, pos-vel.xy           ) *  1.
             //+ texture2D(txt, pos+vel.yx*vec2(-1,1)) * -1.
             //+ texture2D(txt, pos-vel.yx*vec2(-1,1)) * -1.
             ;
    return sum;
}

void main() {

    vec4 c = sharp(bufC, vUv); // original texture
    vec4 b = texture2D(bufB, vUv); // velocity texture
    vec2 vel = (b.gr-0.5)*vec2(-1.0, 1.0)/512.0;

    vec4 n = normalize(b*2.0-1.0);
    vec4 l = normalize(vec4(1.0, -1.0, 1.0,0.0));
    float  bump = dot(n,l);
    c = c-bump/4.0;

    //vec4 a = texture2D(bufA, vUv);
    //for(float i=-2.0; i<2.0;i+=0.2) a += (texture2D(bufA, vUv+vel*i)-a)/2.0;
    vec4 a = texture2D(bufA, vUv+vel);
    vec4 s = sharp(bufA, vUv);
    a = mix(a,s,0.002); 
    // n = normalize(a*2.0-1.0);
    // bump = max(dot(n,l),0.0);
    //vec4 a = vec4(overlay(a1.rgb,a2.rgb),1.0);
    float i = floor(time*1.0);
    float f = fract(time*1.0);
    float k = mix(rand2(vUv+i, 0.2), rand2(vUv+i+1.0, 0.2), smoothstep(0.0, 1.0, f));
    float noise =(rand(vUv*1000.0+time)-rand(vUv*1000.0+time+1.0))*0.05;
    // a*=0.99;
    // gl_FragColor = a*(1.0-k)+c*k+noise;
    //a*=0.99;
    gl_FragColor = mix(a,c,k)+ noise; // mix(a,c+noise,k);
    // gl_FragColor = vec4(k);
    // if(time <0.5) {
    //     gl_FragColor = vec4(c.rgb, 1.0);
    // }
}
