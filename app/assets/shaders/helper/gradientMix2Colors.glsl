const float PI = 3.141592653589793;

mat2 scale(vec2 value) {
  return mat2(value.x, 0.0, 0.0, value.y);
}

mat2 rotate2d(float value){
  return mat2(cos(value), -sin(value), sin(value), cos(value));
}

vec3 gradientMix2Colors(vec2 st, float tick, vec3 col1, vec3 col2, vec2 pos){
  vec3 c1 = col1;
  vec3 c2 = col2;

  st -= pos;
  st *= scale(vec2(3.8));
  st *= rotate2d(tick * PI);
  st += pos;

  return mix(c1, c2, st.x);
}

#pragma glslify: export(gradientMix2Colors);