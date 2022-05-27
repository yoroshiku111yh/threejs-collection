
// Credit : 
// https://iquilezles.org/articles/normalsSDF/

vec3 calcNormal2(in vec3 p){
    const float eps = .0001;
    const vec2 h=vec2(eps,0.0);
	return normalize(vec3(sdf(p+h.xyy).x-sdf(p-h.xyy).x,
	sdf(p+h.yxy).x-sdf(p-h.yxy).x,
	sdf(p+h.yyx).x-sdf(p-h.yyx).x));
}

#pragma glslify: export(calcNormal2)