uniform float time;
uniform float progress;
uniform int totalOrb;
uniform vec3 colorOrb;
uniform vec4 resolution;
uniform vec2 mouse;
uniform bool isMouseLeave;
varying vec2 vUv;
float PI = 3.141592653589793238;

#pragma glslify:sdBox=require('../helper/raymarching/sdBox');
#pragma glslify:sdSphere=require('../helper/raymarching/sdSphere');
#pragma glslify:fresnelFn=require('../helper/fresnel');

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1. - c;

    return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0., oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0., oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0., 0., 0., 0., 1.);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.)).xyz;
}

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float smin(float a, float b, float k) {
    float h = clamp(.5 + .5 * (b - a) / k, 0., 1.);
    return mix(b, a, h) - k * h * (1. - h);
}

vec2 sdf(vec3 p ) {
    float radius = 0.15;
    float type = 0.;
    int total = totalOrb;
    vec3 p1 = rotate(p, vec3(1.), time / 5.);
    float box = smin(sdBox(p1, vec3(.2)), sdSphere(p, .2), radius);

    float realSphere = sdSphere(p1, radius);
    float final = mix(box, realSphere, .5 + .5 * sin(time / 3.));
    
    for(int i = 0; i < total; i++) {
        float randOffset = rand(vec2(i, 0));
        float progr = 1. - fract(time / 3. + randOffset * 3.);
        vec3 pos = vec3(sin(randOffset * 2. * PI), cos(randOffset * 2. * PI), 0.);
        float goToCenter = sdSphere(p - pos * progr, .05);
        final = smin(final, goToCenter, radius);
    }
    float radiusMouseSphere = 0.;
    if(isMouseLeave == false){
        radiusMouseSphere = .1 + .05 * sin(time);
    }
    float mouseSphere = sdSphere(p - vec3(mouse * resolution.zw * 2., 0.), radiusMouseSphere*0.5);

    if(mouseSphere < final)
        type = 1.;

    return vec2(smin(final, mouseSphere, .1), type);
}

vec3 calcNormal1(in vec3 p) {
    const float eps = .0001;
    const vec2 h = vec2(0.5, -0.5) * eps;
    return normalize(vec3(sdf(p + h.xyy).x - sdf(p - h.xyy).x, sdf(p + h.yxy).x - sdf(p - h.yxy).x, sdf(p + h.yyx).x - sdf(p - h.yyx).x));
}

void main() {
    float dist = length(vUv - vec2(.5));
    vec3 bg = mix(vec3(.3), vec3(.0), dist);
    vec2 newUV = (vUv - vec2(.5)) * resolution.zw + vec2(.5);
    vec3 camPos = vec3(0., 0., 2.);
    vec3 ray = normalize(vec3((vUv - vec2(.5)) * resolution.zw, -1.));

    vec3 rayPos = camPos;
    float t = 0.;
    float tMax = 5.;

    float type = 1.;

    for(int i = 0; i < 256; ++i) {
        vec3 pos = camPos + t * ray;
        float h = sdf(pos).x;
        type = sdf(pos).y;
        if(h < .0001 || t > tMax)
            break;

        t += h;
    }
    vec3 color = bg;
    if(t < tMax) {
        vec3 pos = camPos + t * ray;
        color = vec3(1.);
        vec3 normal = calcNormal1(pos);
        color = normal;

        color = colorOrb;

        float fresnel = fresnelFn(ray, normal);
        color = mix(color, bg, fresnel);
    }
    gl_FragColor = vec4(color, 1.);
}