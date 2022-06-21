//https://www.shadertoy.com/view/XtGyDR

vec3 MIX(vec3 x, vec3 y) {
    return abs(x - y);
}

float CV(vec3 c, vec2 uv, vec3 iResolution) {
    float size = 640. / iResolution.x * 0.003;
    return 1.0 - clamp(size * (length(c.xy - uv) - c.z), 0., 1.);
}

vec4 causticCrystal(vec3 iResolution, float iTime, vec2 uv, vec3 colorModify, bool isNoUseModify) {
    vec4 O = vec4(0., 0., 0., 1);
    for(float i = 0.; i < 60.; i += 4.5) {
        vec3 c = vec3(sin(i * 0.57 + 7. + iTime * .7), sin(i * 0.59 - 15. - iTime * .65), sin(i * 0.6 + iTime * .9)) * 0.75 + 0.75;
        if(!isNoUseModify){
            c = colorModify;
        }
        float cv = CV(
            vec3(
                sin(iTime * 0.5 + i / 4.5) * (iResolution.x / 2. - 60.) + iResolution.x / 2., 
                sin(iTime * 0.73 + i / 3.) * (iResolution.y / 2. - 60.) + iResolution.y / 2., 
                0.0), 
            uv, 
            iResolution);
        O.rgb = MIX(O.rgb, c*cv);
    }
    return O;
}

#pragma glslify: export(causticCrystal)