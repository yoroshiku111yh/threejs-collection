uniform float time;

varying vec3 eyeVector;
varying vec3 worldNormal;
varying vec3 v_normal;
uniform float zVertex ;
uniform float zWorldPosition ;

void main() {
    v_normal = normalMatrix * normal;
    vec4 worldPosition = modelMatrix * vec4(position, zWorldPosition);
    eyeVector = normalize(worldPosition.xyz - cameraPosition);
    worldNormal = normalize(modelViewMatrix * vec4(normal, 0.0)).xyz;

	//gl_Position = projectionMatrix * modelViewMatrix * vec4(sin(position.x*time*0.001), position.y, position.z, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, zVertex);
}