precision highp float;
attribute vec3 position;
uniform mat4 mvp;
uniform float time;

void main(){
    gl_Position = mvp * vec4(position,1.0);
    gl_PointSize = 10.0;
}