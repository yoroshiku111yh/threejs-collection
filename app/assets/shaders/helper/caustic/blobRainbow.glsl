// https://www.shadertoy.com/view/7lffzl

// vec4 blobRainbowEventMouse(vec2 uv, vec2 iMouse, vec2 iResolution, float iTime){ // maybe use for research later
//     vec4 fragColor;
//     vec2 mouseRel = iMouse.xy / iResolution.xy;//vec2(1280.,720.);
//     vec2 relCenter = vec2(0.5,0.5);
    
    
//     // Rotation Direction
//     vec3 baseValue = vec3(0,2,4);
//     vec3 initialRotationDirection = baseValue;

//     // Brightness
//     float distanceFromCenter = length(mouseRel.xy-relCenter);
//     float relCenterRadius = 0.1;
//     float distanceSensitivity = 20.;
//     float inTheZone = max(relCenterRadius,distanceFromCenter) - relCenterRadius;
//     float brightness = 1. - distanceSensitivity*inTheZone;
    
//     // Circle
//     float distanceFromMouse = 5.*length(uv - mouseRel);
//     float fuzzyFactor1 = 5.;
//     float fuzzyFactor2 = 1.6;
//     float centerBright = 5.;
//     vec3 circleArea = vec3(centerBright*brightness + fuzzyFactor1*pow(distanceFromMouse,fuzzyFactor2));

//     // Time varying pixel color
//     vec3 timeVarying = cos(iTime+uv.xyx+initialRotationDirection);
    
//     vec3 col = 0.5 + distanceFromCenter*circleArea *0.03 + 0.5*timeVarying;
    
//     // Output to screen
//     return fragColor = vec4(col,1.0);
// }

vec3 blobRainbow( vec2 uv, float iTime, vec2 posPin, float distanceMulti) //out vec4 fragColor, in vec2 fragCoord
{
    vec2 relCenter = vec2(0.5,0.5);
    
    
    // Rotation Direction
    vec3 baseValue = vec3(0,2,4);
    vec3 initialRotationDirection = baseValue;

    // Brightness
    float distanceFromCenter = length(posPin.xy - relCenter);
    float relCenterRadius = 0.1;
    float distanceSensitivity = 20.;
    float inTheZone = max(relCenterRadius,distanceFromCenter) - relCenterRadius;
    float brightness = 1. - distanceSensitivity*inTheZone;
    
    // Circle
    float distanceFromMouse = distanceMulti*length(uv - posPin);
    float fuzzyFactor1 = 5.;
    float fuzzyFactor2 = 1.6;
    float centerBright = 5.;
    vec3 circleArea = vec3(centerBright*brightness + fuzzyFactor1*pow(distanceFromMouse,fuzzyFactor2));

    // Time varying pixel color
    vec3 timeVarying = cos(iTime+uv.xyx+initialRotationDirection);
    
    vec3 col = distanceFromCenter*circleArea *0.03 + 0.5*timeVarying;
    // Output to screen
    return col;
}

#pragma glslify: export(blobRainbow)