
#define MAX_STEPS 256
#define MAX_DIST 256.
#define SURF_DIST .0005
#define Rot(a) mat2(cos(a),-sin(a),sin(a),cos(a))
#define MATERIAL 0

#pragma glslify:cover=require('../helper/cover');

varying vec2 vUv;
varying float vBlend;
uniform float iTime;
uniform vec4 iResolution;
uniform sampler2D iTexture;
uniform vec2 iTextureSize;
uniform vec2 iContainSize;

vec3 N33(vec3 p) {
    vec3 a = fract(p * vec3(123.34, 234.34, 345.65));
    a += dot(a, a + 34.35);
    return fract(vec3(a.x * a.y, a.y * a.z, a.z * a.x));
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0., 1.);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float hash(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float metaball(vec3 p, float i, float t) {
    vec3 n = N33(vec3(i));
    vec3 p2 = sin(n * t) * 0.2;
    vec3 spp = p - p2;
    float sp = length(spp) - 0.01;
    return sp;
}

vec2 GetDist(vec3 p) {

    float k = 0.4; // radius metalball fly total
    float d = 10.0;
    float t = iTime * 3.0;

    d = smin(d, metaball(p, 0.3, t), k);
    d = smin(d, metaball(p, 0.6, t), k);
    d = smin(d, metaball(p, 0.9, t), k);
    d = smin(d, metaball(p, 1.2, t), k);
    d = smin(d, metaball(p, 1.5, t), k);

    vec2 model = vec2(d, MATERIAL);
    return model;
}

vec2 RayMarch(vec3 ro, vec3 rd, float side, int stepnum) {
    vec2 dO = vec2(0.0);

    for(int i = 0; i < stepnum; i++) {
        vec3 p = ro + rd * dO.x;
        vec2 dS = GetDist(p);
        dO.x += dS.x * side;
        dO.y = dS.y;

        if(dO.x > MAX_DIST || abs(dS.x) < SURF_DIST)
            break;
    }

    return dO;
}

vec3 GetNormal(vec3 p) {
    float d = GetDist(p).x;
    vec2 e = vec2(.001, 0);

    vec3 n = d - vec3(GetDist(p - e.xyy).x, GetDist(p - e.yxy).x, GetDist(p - e.yyx).x);

    return normalize(n);
}

vec3 R(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 f = normalize(l - p), r = normalize(cross(vec3(0, 1, 0), f)), u = cross(f, r), c = p + f * z, i = c + uv.x * r + uv.y * u, d = normalize(i - p);
    return d;
}

// thx iq! https://iquilezles.org/articles/distfunctions2d/
float sdBox(in vec2 p, in vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// vec3 drawBg(vec2 p, vec3 col){
//     float d = shaderText(p*1.7);
//     col = mix(col,vec3(0.0),S(d,0.0));
//     return col;
// }

vec3 drawBg(vec2 p, vec3 col) {
    vec4 tex = texture2D(iTexture, p);
    col = mix(col, tex.rgb, tex.a);
    return col;
}

vec3 reflectMaterial(vec2 p, vec3 rd, vec3 n) {
    vec3 r = reflect(rd, n);
    float clearGamma = 0.25;
    vec3 refTex = drawBg(p, vec3(max(0.95, r.y))) + (r * sin(iTime) * clearGamma);
    return refTex;
}

vec3 materials(int mat, vec3 n, vec3 rd, vec2 p, vec3 col) {
    if(mat == MATERIAL) {
        col = reflectMaterial(p, rd, n);
    }
    return col;
}

void main() {
    //vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec2 uv = vUv - vec2(0.5, 0.5);
    vec2 coverUv = cover(vUv, iContainSize, iTextureSize);
    vec2 newUv = coverUv;
    //vec2 prevUV = uv;
    //vec2 m =  iMouse.xy/iResolution.xy;

    vec3 ro = vec3(0, 0, -1.0);
    float zBall = 1.0;
    vec3 rd = R(uv, ro, vec3(0, 0.0, 0.0), zBall);
    vec2 d = RayMarch(ro, rd, 1., MAX_STEPS);
    vec4 col = vec4(1.0);
    if(d.x < MAX_DIST) {
        vec3 p = ro + rd * d.x;
        vec3 n = GetNormal(p);
        float len = pow(length(n.xy), 3.0);
        newUv += n.xy * len * 0.02;
        int mat = int(d.y);
        col.rgb = materials(mat, n, rd, newUv, col.rgb);
    } else {
        //col = tex.rgb;
        col.rgb = drawBg(coverUv, col.rgb);
    }

    // gamma correction
    col.rgb = pow(col.rgb, vec3(0.9545));
    vec4 final = vec4(col.rgb, 1.0);
    gl_FragColor = final;
}