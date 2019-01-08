precision highp float;

attribute float index;
attribute vec3 position;

uniform mat4 mvp;
uniform float time;
uniform float texture;

varying vec3 vColor;

void main(){
    vec3 pos = position;
    vec3 pos2 = vec3(index * 0.001);
    pos.y += index;
    gl_Position = mvp * vec4(pos2,1.0);
    gl_PointSize = 2.0;
    
    vColor = vec3(1.0);
}