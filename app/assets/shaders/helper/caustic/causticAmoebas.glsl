//https://www.shadertoy.com/view/wl2SzR

#define FIELD 10.0
#define HEIGHT 0.7
#define ITERATION 2.0
#define TONE vec4(.2,.4,.8,0)
#define SPEED 0.5

float eq(vec2 p,float t){
	float x = sin( p.y-t +cos(t+p.x*.8) ) * cos(p.x-t);
	x *= acos(x);
	return - x * abs(x-.05) * p.x/p.y*4.9;
}

vec4 causticAmoebas(vec2 uv, float uTick){
    vec2  p = FIELD*(uv  +.9);
    float t = uTick*10.*SPEED;
    float hs = FIELD*(HEIGHT+cos(t)*1.9);
	float x = eq(p,t);
    float y = p.y-x*0.1;
    vec4 X = vec4(1.0);
    vec4 O;
    for(float i=0.; i<ITERATION; ++i){
        p.x *= 1.5;
        X = x + vec4(0, eq(p,t+i+1.), eq(p,t+i+2.) ,0);
        x = X.z += X.y;
        O += TONE / abs(y-X-hs);
    }
    return O;
}

#pragma glslify: export(causticAmoebas)