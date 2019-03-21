varying vec3 vViewPosition;
varying vec3 vWorldPosition;
uniform sampler2D texturePosition;

float PI = 3.141592653589793;

void main() {
    vec3 p = position;
    vec4 t = texture2D( texturePosition, uv );
    vec3 pos = t.xyz;
    float len = length(pos);
    p *= abs(sin(len * 1.0)) + smoothstep(2.0,9.0,len) * 10.0;

    vec4 mvPosition = modelViewMatrix * vec4(p + pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vec4 worldPosition = modelMatrix * vec4(p + pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    vViewPosition = -mvPosition.xyz; 
    gl_PointSize = 3.0;
}


