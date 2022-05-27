// Credit : 
// https://iquilezles.org/articles/normalsSDF/

vec3 calcNormal1(in vec3 p){
    const float eps = .0001;
    const vec2 h = vec2(0.5, -0.5)*eps;
	return normalize(vec3(sdf(p+h.xyy).x-sdf(p-h.xyy).x,
	sdf(p+h.yxy).x-sdf(p-h.yxy).x,
	sdf(p+h.yyx).x-sdf(p-h.yyx).x));
}
