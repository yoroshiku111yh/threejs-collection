
// multi-side refraction : https://codesandbox.io/s/w0ntb?file=/src/refraction-material/fragment.glsl:644-1536

uniform sampler2D envMap;
uniform samplerCube envCubeMap;
uniform vec3 resolution;
uniform float ior;
uniform float uTime;
uniform vec3 colorRefraction;
uniform vec3 colorReflect;
uniform bool isRefract;
uniform bool isHaveEnvCubeMap;


varying vec3 worldNormal;
varying vec3 viewDirection;
varying vec3 eyeVector;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
	return pow( 1.0 + dot( eyeVector, worldNormal), 1.5 );
}

void main() {
	//water is 1.33 and diamond has an IOR of 2.42.
	float iorVal = ior;
	// get screen coordinates
	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec3 normal = worldNormal;
	// calculate refraction and add to the screen coordinates
	vec3 refracted = refract(eyeVector, normal, 1.0/iorVal);
	if(isRefract){
		uv += refracted.xy;
	}

	// sample the background texture
	vec4 tex;
	tex.r = texture2D(envMap, uv * colorRefraction.r).r;
	tex.g = texture2D(envMap, uv * colorRefraction.g).g;
	tex.b = texture2D(envMap, uv * colorRefraction.b).b;

	vec4 outputTex = tex;

	// calculate the Fresnel ratio
	float f = Fresnel(eyeVector, normal);

	///////////////cube map
	vec3 normalizedWord = normalize(worldNormal);
	vec4 _cubeMap = textureCube(envCubeMap, eyeVector);
	//_cubeMap.rgb *= colorReflect;
	// mix the refraction color and reflection color
	if(isHaveEnvCubeMap == false){
		outputTex.rgb = mix(outputTex.rgb, colorReflect, f);
	}
	else{
		outputTex.rgb = mix(outputTex.rgb, _cubeMap.rgb, f);
	}
	gl_FragColor = vec4(outputTex.rgb, 1.0);
}