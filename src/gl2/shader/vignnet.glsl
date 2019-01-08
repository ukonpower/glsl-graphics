precision highp float;
uniform sampler2D texture;
uniform vec2 resolution;

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 cuv = uv * 2.0 - 1.0;
  vec3 c = texture2D(texture,uv).xyz;

  float vig = max(0.0,1.0 - length(cuv));
  c *= vig;
  gl_FragColor = vec4(c,1.0);
}