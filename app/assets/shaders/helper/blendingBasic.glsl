// 0 = Multiply
// 1 = Screen
// 2 = Overlay
#define BLEND_MODE 0

vec3 blendBasic(vec3 a, vec3 b) {

    #if BLEND_MODE == 1
    return 1. - ((1. - a) * (1. - b));
    #elif BLEND_MODE == 0
    return a * b;
    #elif BLEND_MODE == 2
    if(a.x < .5 && a.y < .5 && a.z < .5) {
        return 2. * a * b;
    }
    return 1. - 2. * (1. - a) * (1. - b);
    #endif

    return a;

}

#pragma glslify: export(blendBasic);