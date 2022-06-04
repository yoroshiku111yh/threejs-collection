varying vec2 vUv;
uniform vec3 iResolution;
uniform sampler2D iChannel0;
uniform vec4 iMouse;
uniform float iTime;
uniform int iFrame;

//#define AUTO

#define STRENGTH     (0.5) // wave of life
#define MODIFIER     (0.99) // circle
#define STEP         (5.00) 

#define S(e) (texture(iChannel0, p+e).x) // Sample

vec3 getPos() {
#ifdef AUTO
    float t = iTime * 5.0;
    vec2 s = fract(floor(t) * vec2(0.456665, 0.708618)) * iResolution.xy;
    return vec3(s, 1);
#else
    if(iMouse.z > 0.)
        return vec3(iMouse.xy, 1);
    return vec3(0);
#endif /* AUTO */
}

void main() {
    float d = 0.;
    vec2 p = gl_FragCoord.xy / iResolution.xy;
    vec4 c = texture(iChannel0, p);
    vec3 e = vec3(vec2(STEP) / (iResolution.xy), 0.);
    /////https://www.shadertoy.com/view/3sB3WW  
   	//float s0 = c.y, s1 = S(-e.zy), s2 = S(-e.xz), s3 = S(e.xz), s4 = S(e.zy);
    /////https://www.shadertoy.com/view/4dK3Ww
    float s0 = c.y;
    float s1 = texture(iChannel0, p - e.zy).x;
    float s2 = texture(iChannel0, p - e.xz).x;
    float s3 = texture(iChannel0, p + e.xz).x;
    float s4 = texture(iChannel0, p + e.zy).x;

    vec3 pos = getPos();
    if(pos.z > 0.5) {
        d = STRENGTH * smoothstep(4.5, .5, length(pos.xy - gl_FragCoord.xy));
    } else {
        // Simulate rain drops
        float t = iTime * 2.;
        vec2 pos = fract(floor(t) * vec2(0.456665, 0.708618)) * iResolution.xy;
        float amp = 1. - step(.05, fract(t));
        d = -amp * smoothstep(2.5, .5, length(pos.xy - gl_FragCoord.xy));
    }

   	// Calculate new state
    d += -(s0 - .5) * 2. + (s1 + s2 + s3 + s4 - 2.);
    d *= MODIFIER;
    d *= smoothstep(0., 1.0, float(iFrame >= 20)); // Clean buffer at startup
    d = d * 0.5 + 0.5;
    gl_FragColor = vec4(d, c.x, 0, 0); // Save current and previous state
}