precision highp float;

uniform sampler2D posTexture;
uniform vec2 resolution;
uniform float time;

#define N 32

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 p = texture2D(posTexture,uv).xyz;

  vec3 vel = vec3(0.0);
  vec3 avgPos = vec3(0.0);

  for(int i = 0; i < N; i++){
    for(int j = 0; j < N; j++){
      vec3 p2 = texture2D(posTexture,vec2(i,j) / resolution).xyz;
      if(distance(p,p2) <= 1.0){
        avgPos += p2;
      }
    }
  }

  avgPos /= float(N) * float(N);
  vel += p - avgPos;

  p += vel * 0.01;
  gl_FragColor = vec4(p,1.0);
}