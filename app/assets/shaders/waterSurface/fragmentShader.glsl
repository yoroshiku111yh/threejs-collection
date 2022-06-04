#define TEXTURED 0
#define WATER_COLOR vec3(0.92, 0.95, 1.0)
///https://www.shadertoy.com/view/3sB3WW

varying vec2 vUv;
uniform vec3 iResolution;
uniform sampler2D iChannel1;
uniform sampler2D iChannel0;

#pragma glslify:cover=require('../helper/cover');

//#define DEBUG

#define SPECULAR    (12.)
#define DEPTH       (20.)

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    vec3 waterColor = vec3(0.81, 0.86, 0.96);
    vec4 col = vec4(0.);

    vec2 tc = texture(iChannel0, uv).xy;
    col = texture(iChannel1, tc - (0.5 - uv));
    col.xyz *= waterColor;
    vec3 n = normalize(vec3(length(dFdx(tc)), length(dFdy(tc)), DEPTH / max(iResolution.x, iResolution.y)));
    vec3 n_color = vec3(.9,.25,-.1);
    col.xyz += pow(dot(n, normalize(n_color)), 2.0);
    gl_FragColor = col;

}