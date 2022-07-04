// https://www.shadertoy.com/view/3dSBDD

#define PI2 6.2831853072 // PI * 2
#define PI_O_2 1.5707963268 // PI / 2

const float passes = 10.0;
const float radius = 6.0;
const float lossiness = 2.0;
const float preserveOriginal = 0.0;

vec4 gaussianBlur(sampler2D tex, vec2 uv, vec3 iResolution) {
    vec2 pixel = 1.0 / iResolution.xy;
    float count = 1.0 + preserveOriginal;
    vec4 color = texture2D(tex, uv) * count;
    float directionStep = PI2 / passes;

    vec2 off;
    float c, s, dist, dist2, weight;

    for(float d = 0.0; d < PI2; d += directionStep) {
        c = cos(d);
        s = sin(d);
        dist = 1.0 / max(abs(c), abs(s));
        dist2 = dist * (2.0 + lossiness);
        off = vec2(c, s);
        for(float i = dist * 1.5; i <= radius; i += dist2) {
            weight = i / radius; // 1.0 - cos(i / radius * PI_O_2);
            count += weight;
            color += texture(tex, uv + off * pixel * i) * weight;
        }
    }
    vec4 fragColor = vec4(0.0);
    fragColor = color / count;
    return fragColor;
}

#pragma glslify: export(gaussianBlur)