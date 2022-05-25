varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uOffset;

float M_PI = 3.141529;

vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset){
    position.x = position.x + (sin(uv.y * M_PI) * offset.x);
    position.y = position.y + (sin(uv.x * M_PI) * offset.y);
    return position;
}

void main() {
    vUv = uv;
    vec3 newPos = deformationCurve(position, uv, uOffset);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}