
// multi-side refraction : https://codesandbox.io/s/w0ntb?file=/src/refraction-material/fragment.glsl:644-1536

#pragma glslify:gaussianBlur=require('../helper/blur/gaussianBlur');

uniform sampler2D envMap;
uniform samplerCube envCubeMap;
uniform vec3 resolution;
uniform float ior;
uniform float uTime;
uniform vec3 colorRefraction;
uniform vec3 colorReflect;
uniform bool isRefract;
uniform bool isHaveEnvCubeMap;
uniform float bias; // 0.0
uniform float scale; // 1.0
uniform float power; // 3.0

uniform float powerBlur;
uniform float powerRefract;

uniform bool isEnableRefractionColor;

varying vec3 worldNormal;
varying vec3 viewDirection;
varying vec3 eyeVector;
varying vec3 v_normal;

float Fresnel(vec3 eyeVector, vec3 worldNormal, float bias, float scale, float power) {
	//return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
	return bias + scale * pow(1.0 + dot(eyeVector, worldNormal), power);
}


void main() {
	//water is 1.33 and diamond has an IOR of 2.42.
	float iorVal = ior;
	// get screen coordinates
	vec3 _resolution = vec3(resolution.x, resolution.y, resolution.z);
	vec2 uv = gl_FragCoord.xy / _resolution.xy;
	vec2 texCoord = gl_FragCoord.xy / _resolution.xy;
	vec3 normal = worldNormal;
	// calculate refraction and add to the screen coordinates
	vec3 refracted = refract(eyeVector, normal, 1.0/iorVal);
	if(isRefract){
		uv += refracted.xy*powerRefract;
	}

	// sample the background texture
	vec4 tex;
	if(isEnableRefractionColor){
		// tex.r = texture2D(envMap, uv * colorRefraction.r).r;
		// tex.g = texture2D(envMap, uv * colorRefraction.g).g;
		// tex.b = texture2D(envMap, uv * colorRefraction.b).b;
		tex.r = gaussianBlur(envMap, uv* colorRefraction.r, _resolution, powerBlur).r;
		tex.g = gaussianBlur(envMap, uv* colorRefraction.g, _resolution, powerBlur).g;
		tex.b = gaussianBlur(envMap, uv* colorRefraction.b, _resolution, powerBlur).b;
	}
	else{
		//tex = texture2D(envMap, uv);
		tex = gaussianBlur(envMap, uv, _resolution, powerBlur);
	}
	vec4 outputTex = tex;

	// calculate the Fresnel ratio
	float f = Fresnel(eyeVector, normal, bias, scale, power);

	///////////////cube map
    vec2 thetaphi = ((uv * 2.0) - vec2(1.0)) * vec2(3.1415926535897932384626433832795, 1.5707963267948966192313216916398); 
    vec3 rayDirection = vec3(cos(thetaphi.y) * cos(thetaphi.x), sin(thetaphi.y), cos(thetaphi.y) * sin(thetaphi.x));
	vec4 _cubeMap = textureCube(envCubeMap, rayDirection);
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