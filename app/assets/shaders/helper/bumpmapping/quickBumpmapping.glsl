// https://github.com/hughsk/glsl-hsv2rgb
// https://www.shadertoy.com/view/3tG3DD
// Used for changing the light colour
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


float luminance(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

// Use pixel luminance for height
float texelHeight(vec4 rgba) {
    return luminance(rgba.rgb);
}

vec4 quickBumpMapping( vec2 uv, vec3 iResolution, sampler2D iChannel0, float iTime )
{
    vec4 fragColor;
    // Normal map strength
    const float normal_strength = 7.0;
    
    // Bump height multiplier
    const float height_multiplier = 5.0;
    const float texel_offset = 2.0;
    
    //vec2 uv = fragCoord/iResolution.xy;
    
    vec3 offset = vec3(texel_offset / iResolution.xy, 0.0);
    
    vec3 surfaceColor = texture(iChannel0, uv).rgb;
	float height = texelHeight(surfaceColor.rgbb) * height_multiplier;
    vec3 worldPosition = vec3(uv, height);
    
    // Take a difference between the right texel and the left texel
    float ddX = texelHeight(texture(iChannel0, uv + offset.xz))
        	  - texelHeight(texture(iChannel0, uv - offset.xz));
    
    // Take a difference between the bottom texel and the top texel
    float ddY = texelHeight(texture(iChannel0, uv + offset.zy))
        	  - texelHeight(texture(iChannel0, uv - offset.zy));
    
    ddX *= normal_strength / texel_offset;
    ddY *= normal_strength / texel_offset;
    
    // I'm probably using the wrong nomenclature here don't sue me
    vec3 tangent   = normalize(vec3(1.0, 0.0, ddX));
    vec3 bitangent = normalize(vec3(0.0, 1.0, ddY));
    
    // As easy as one two seven NaN NaN—±¼¿Ə↔ Segmentation fault
    vec3 normal = cross(tangent, bitangent);
    
    vec2 lightPosition = 0.5 + 0.4 * vec2(cos(iTime), sin(iTime));
    vec3 lightColor = hsv2rgb(vec3(mod(iTime * 0.1, 1.0), 0.1, 1.0));
    float lightStrength = 10.0;
    float lightHeight = 2.8;
    
    vec3 lightDir = normalize(vec3(lightPosition, lightHeight) - worldPosition);
    
    float attenuation = lightStrength / pow(distance(lightPosition, uv) + lightHeight, 2.0);
    
    float lambert = max(0.0, dot(lightDir, normal));
    float blinnPhong = pow(max(dot(normalize(vec3(vec3(0.0, 0.0, 1.0)) + normal), lightDir), 0.0), 10.0);
    
    float ambient = 0.0;
    float diffuse = 0.5 * lambert;
    float specular = 0.5 * blinnPhong;
    
    vec3 col = ambient + (diffuse * surfaceColor + specular) * attenuation * lightColor;
    
    float luma = luminance(col);
    luma *= 3.5;
    col /= luma / (luma + 1.0);

    // Output to screen
    fragColor = vec4(col,1.0);
    return fragColor;
}

#pragma glslify: export(quickBumpMapping)