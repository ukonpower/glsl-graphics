varying vec3 vViewPosition;
varying vec3 vNormal;
uniform sampler2D texturePosition;
uniform float uvDiff;

float PI = 3.141592653589793;

float atan2(in float y, in float x)
{
    return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}

mat2 rotate(float rad){
    return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));
}

void main() {
    vec2 nUV = uv + vec2(uvDiff,0.0);
    if(nUV.x >= 1.0){
        nUV = uv - vec2(uvDiff,0.0);
    }
    vec3 p = position;
    vec3 pos = texture2D( texturePosition, uv ).xyz;
    vec3 nPos = texture2D( texturePosition, nUV).xyz;

    vec3 vec = normalize(pos - nPos);

    float rotY = atan2(vec.x,vec.z);
    float rotX = atan2(vec.y,vec.z);

    p.xz *= rotate(rotY);
    p.yz *= rotate(rotX);
    

    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vec3 c = vec3(uv.y,sin(uv.y * 3.0),1.0); 
    // vColor = vec4(1.0);

    vNormal = normalMatrix * normal;
    vViewPosition = -(modelViewMatrix * vec4(position, 1.0)).xyz;
}


