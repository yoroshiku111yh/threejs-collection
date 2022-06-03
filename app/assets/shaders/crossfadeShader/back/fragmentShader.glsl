uniform sampler2D envMap;
uniform vec2 resolution;
uniform float ior;

varying vec3 worldNormal;
varying vec3 viewDirection;
varying vec3 eyeVector;

void main() {
	//water is 1.33 and diamond has an IOR of 2.42.
	float iorVal = ior;

	// get screen coordinates
	vec2 uv = gl_FragCoord.xy / resolution;

	vec3 normal = worldNormal;
	// calculate refraction and add to the screen coordinates
	vec3 refracted = refract(eyeVector, normal, 1.0/iorVal);
	uv += refracted.xy;
	
	// sample the background texture
	vec4 tex = texture2D(envMap, uv);

	vec4 outputTex = tex;
	gl_FragColor = vec4(outputTex.rgb, 1.0);
}