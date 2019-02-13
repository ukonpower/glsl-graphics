precision highp float;
uniform sampler2D texture;
uniform vec2 resolution;
uniform float time;
void main(){
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 c = texture2D(texture,uv).xyz;
    // c += sin(time);
    gl_FragColor = vec4(c,1.0);
}