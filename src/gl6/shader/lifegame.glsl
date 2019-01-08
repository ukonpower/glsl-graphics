precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec2 resolution;

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;

  int count = 0;
  vec3 c1 = texture2D(texture1,uv).xyz;
  vec3 c2 = texture2D(texture2,uv).xyz;
  vec3 c = c1 + c2;

  for(int i = -1; i <= 1; i++){
    for(int j = -1; j <= 1; j++){
      if(i == 0 && j == 0){continue;}
      vec2 puv = uv + vec2( float( i ), float( j ) ) / resolution;
      // vec2 puv = gl_FragCoord.xy + vec2(float(i),float(j)) / resolution;
      if(texture2D(texture1,puv).x + texture2D(texture2,puv).x >= 1.0){
        count += 1;
      }
    }
  }

  if(c.x == 0.0){
    if(count == 3){
      c = vec3(1.0);
    }else{
      c = vec3(0.0);
    }
  }else{
    if(count >= 2 && count <= 3){
      c = vec3(1.0);
    }else{
      c = vec3(0.0);
    }
  }
  
  gl_FragColor = vec4(c,1.0);
}