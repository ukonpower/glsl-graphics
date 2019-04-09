varying vec3 vViewPosition;
varying vec3 vWorldPosition;
uniform float time;
uniform sampler2D texturePosition;

float PI = 3.141592653589793;

highp mat2 rotate(float rad){
    return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));
}

void main() {
    vec3 p = position;
    vec4 t = texture2D( texturePosition, uv );
    vec3 pos = t.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(p + pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vec4 worldPosition = modelMatrix * vec4(p + pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    vViewPosition = -mvPosition.xyz; 
}