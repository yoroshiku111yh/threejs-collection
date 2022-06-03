
// multi-side refraction : https://codesandbox.io/s/w0ntb?file=/src/refraction-material/fragment.glsl:644-1536
//crossfade : https://www.shadertoy.com/view/Ntt3Rs

uniform sampler2D envMap;
uniform sampler2D envMap2;
uniform sampler2D maskTex;
uniform vec2 resolution;
uniform float ior;
uniform float uTime;


varying vec3 worldNormal;
varying vec3 viewDirection;
varying vec3 eyeVector;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
	return pow( 1.0 + dot( eyeVector, worldNormal), 3.0 );
}

float crossfadelength = 1.;
float textureZoom = .3;

void main() {
	//water is 1.33 and diamond has an IOR of 2.42.
	float iorVal = ior;
	
	// get screen coordinates
	vec2 uv = gl_FragCoord.xy / resolution;
    ////////////
    float time = sin(uTime)* .5 + .5;
    float progress = time;
    progress *= (1. + crossfadelength);
    progress -= crossfadelength;

    
    float mask = smoothstep(uv.x - crossfadelength, uv.x, progress);
    
    ////////////

	vec3 normal = worldNormal;
	// calculate refraction and add to the screen coordinates
	vec3 refracted = refract(eyeVector, normal, 1.0/iorVal);
	uv += refracted.xy;
    ////// crossfade
    
    float noise = texture2D(maskTex, uv*textureZoom).b;
    noise *= mask;
    noise += mask;
    noise = clamp(noise, 0., 1.);

    vec3 texture1 = texture2D(envMap, uv).rgb;
    vec3 texture2 = texture2D(envMap2, uv).rgb;

    vec3 col = mix(texture1, texture2, noise);

    //////
	// calculate the Fresnel ratio
	float f = Fresnel(eyeVector, normal);

    col = mix(col, vec3(1.0), f);
	gl_FragColor = vec4(col, 1.0);
}