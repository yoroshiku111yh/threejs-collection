float pointLight (vec2 uv, float h, float i){
    return i * h * pow(dot(uv, uv) + h*h, -1.5);
}

float linTosrgb(float val){
    if(val < 0.0031308){
        return val * 12.92;
    }
    else{
        return 1.065 * pow(val, 1.0/2.4) - 0.055;
    }
}

vec4 pointLightPhysic(vec2 uv, float iTime, float power){
    //float power = 0.005;
    float spring = 0.1;
    float h = pow(sin(iTime/3.), 2.)* spring + 0.001;
    float v = pointLight(uv + vec2(0.25), h, power);
    v = linTosrgb(v);
    return vec4(v);
}

#pragma glslify: export(pointLightPhysic)