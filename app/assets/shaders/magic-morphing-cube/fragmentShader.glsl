/// https://www.shadertoy.com/view/Xd3cR7

#define PI  3.14159
#define TAU 6.28318

varying vec2 vUv;

const float MAX_DISTANCE = 100.;
const float EPSILON = .0001;
const int NUM_MARCHES = 255;
const float BOX_EXTENTS = 3.;
const float RADIUS = .5;
const float RADIUS_COMPONENT = .35355; // sqrt(RADIUS^2 / 2)

uniform float iTime;
uniform sampler2D iChannel1;
uniform sampler2D iChannel0;

float udRoundBox( vec3 p, vec3 b, float r )
{
  return length(max(abs(p)-b,0.0))-r;
}

mat3 rotateY(float rads)
{
    return mat3(
        vec3(cos(rads), 0., sin(rads)),
        vec3(0., 1., 0.),
        vec3(-sin(rads), 0., cos(rads))
    );
}

float sceneSDF(vec3 p, mat3 modelMatrix)
{
    p *= modelMatrix;
    return udRoundBox(p, vec3(BOX_EXTENTS), RADIUS);
}

float getGrey(vec3 p){ return p.x*0.299 + p.y*0.587 + p.z*0.114; }

vec3 tex3D( sampler2D tex, vec3 p, vec3 n, mat3 mat)
{
   	n *= mat;;
    
    n = max((abs(n) - 0.2)*7., 0.001);
    n /= (n.x + n.y + n.z );  
    
	return (texture(tex, p.yz)*n.x + texture(tex, p.zx)*n.y + texture(tex, p.xy)*n.z).xyz;
}

vec3 bump( sampler2D tex, in vec3 p, in vec3 nor, float bumpfactor, mat3 mat){
   
    const float eps = 0.001;
    vec3 grad = vec3( getGrey(tex3D(tex, vec3(p.x-eps, p.y, p.z), nor, mat)),
                      getGrey(tex3D(tex, vec3(p.x, p.y-eps, p.z), nor, mat)),
                      getGrey(tex3D(tex, vec3(p.x, p.y, p.z-eps), nor, mat)));
    grad = (grad - getGrey(tex3D(tex,  p , nor, mat))) / eps; 

    return normalize( nor + grad*bumpfactor );
	
}

vec3 phong(vec3 normal, vec3 light, vec3 view)
{
    const vec3 ambientColor = vec3(1., 1., 1.);
    const vec3 diffuseColor = vec3(1., 1., 1.);
    const vec3 specularColor = vec3(1., 1., 1.);
    const float shininess = 16.;
    const float ambientStrength = .25;
    
    vec3 diffuse = max(dot(normal, light), 0.) * diffuseColor;
    // light is negated because the first argument to reflect is the incident vector
    vec3 specular = pow(max(dot(reflect(-light, normal), view), 0.), shininess) * specularColor;
    vec3 ambient = ambientStrength * ambientColor;
    
    return diffuse + specular + ambient;
}

vec3 gradient(vec3 pos, mat3 mat)
{
    const vec3 dx = vec3(EPSILON, 0., 0.);
    const vec3 dy = vec3(0., EPSILON, 0.);
    const vec3 dz = vec3(0., 0., EPSILON);
    
    return normalize(vec3(
    	sceneSDF(pos + dx, mat) - sceneSDF(pos - dx, mat),
        sceneSDF(pos + dy, mat) - sceneSDF(pos - dy, mat),
        sceneSDF(pos + dz, mat) - sceneSDF(pos - dz, mat)
    ));
}

float distanceToShape(vec3 pos, vec3 dir, mat3 modelMatrix)
{
    float tot = 0.;
    for(int i = 0; i < NUM_MARCHES; i++) {
        float dist = sceneSDF(pos, modelMatrix);
        if (dist < EPSILON || tot > MAX_DISTANCE) {
        	return tot;
        }
        
        tot += dist;
        pos += dir * dist;
    }
    return MAX_DISTANCE;
}

mat4 lookAt(vec3 eye, vec3 target, vec3 up)
{
    vec3 f = normalize(target - eye);
    vec3 r = normalize(cross(f, up));
    vec3 u = normalize(cross(r, f));
    
    return mat4(
        vec4(r, 0.),
        vec4(u, 0.),
        vec4(-f, 0.),
        vec4(0., 0., 0., 1.));
}

// 0 = same side, 1 = opposite side, 2 = x-adjacent, 3 = y-adjacent
float getSide(vec3 p, mat3 modelMatrix)
{
    p = transpose(modelMatrix) * p;
    
    if (p.z > BOX_EXTENTS + RADIUS_COMPONENT) 
    {
    	return 0.;
    }
    else if (p.z < -BOX_EXTENTS - RADIUS_COMPONENT)
    {
    	return 1.;
    }
    else if (abs(p.x) > BOX_EXTENTS + RADIUS_COMPONENT)
    {
    	return 2.;
    }
    
    return 3.;
}

vec3 getColor(vec3 pos, vec3 eye, float texScale, mat3 mat)
{
    const float speed = 1.;
    const float repeat = 2.5;
    const float thickness = .015;
    const float thicknessModifier = 8.;
    const float gridTileWidth = .5;
    const float bumpAmount = .01;
    const vec3 lightPos = vec3(-3., 5., 5.);
    
    float t = mod(iTime, repeat) * speed;
    float side = getSide(pos, mat);
    vec3 originalPos = pos;
    pos = transpose(mat) * pos;
    vec2 uv;
    
    if (side == 0.) uv = pos.xy;
    else if (side == 2.) uv = vec2(2. * BOX_EXTENTS - pos.z, pos.y);
    else if (side == 3.) uv = vec2(pos.x, (2. * BOX_EXTENTS - pos.z));
    else if (abs(pos.x) > abs(pos.y)) uv = vec2(3. * BOX_EXTENTS + BOX_EXTENTS - abs(pos.x), pos.y);
    else uv = vec2(pos.x, 3. * BOX_EXTENTS + BOX_EXTENTS - abs(pos.y));
    
	vec2 node = round(uv / vec2(gridTileWidth)) * gridTileWidth;
    float nodeOffset = 1. - t - (1. - distance(node, vec2(0.)) / thicknessModifier);
    float uvOffset = 1. - t - (1. - distance(uv, vec2(0.)) / thicknessModifier);

    vec2 dist = abs(uv - node) - vec2(nodeOffset);
    float num = min(abs(dist.x), abs(dist.y));
    
    float lerpAmount = clamp(uvOffset / (gridTileWidth / 2.), 0., 1.);
    
    bool swap = floor(mod(iTime / repeat, 2.)) == 0.;
    
    vec3 norm = swap ? 
        			mix(bump(iChannel1, pos * texScale, gradient(originalPos, mat), bumpAmount, mat),
                    	bump(iChannel0, pos * texScale, gradient(originalPos, mat), bumpAmount, mat),
                    	lerpAmount) : 
    				mix(bump(iChannel0, pos * texScale, gradient(originalPos, mat), bumpAmount, mat),
                    	bump(iChannel1, pos * texScale, gradient(originalPos, mat), bumpAmount, mat),
                    	lerpAmount);
    
    
    vec3 light = phong(norm, normalize(lightPos - pos), normalize(eye - pos));
    vec3 col = swap ? 
        			mix(tex3D(iChannel1, pos * texScale, norm, mat),
                   		tex3D(iChannel0, pos * texScale, norm, mat),
                   		lerpAmount) * light :
    				mix(tex3D(iChannel0, pos * texScale, norm, mat),
                   		tex3D(iChannel1, pos * texScale, norm, mat),
                   		lerpAmount) * light;
    
    col.r += mix(0., step(num, thickness), max(0., sign(dist.y + dist.x)));
    
	return col;
}

void main() //out vec4 fragColor, in vec2 fragCoord
{
    const float texScale = 1./6.;
    const mat3 identity = mat3(1., 0., 0., 0., 1., 0., 0., 0., 1.);
    
    //vec2 uv = (2. * fragCoord - iResolution.xy) / iResolution.y;
    vec2 uv = vUv - vec2(0.5, 0.5);


    vec3 eye = vec3(-6., 5., 6.5);
    vec3 ray = normalize(vec3(uv, -1.));
    
    mat3 modelMatrix = rotateY(iTime / 2.);
    
    mat4 viewMat = lookAt(eye, vec3(0.), vec3(0., 1., 0.));
    ray = (viewMat * vec4(ray, 1.)).xyz;
    
    float dist = distanceToShape(eye, ray, modelMatrix);
    vec3 pos = eye + ray * dist;
    
    gl_FragColor = vec4(0.);
    
    if (dist < MAX_DISTANCE) {
        gl_FragColor.rgb = getColor(pos, eye, texScale, modelMatrix);
    }
}