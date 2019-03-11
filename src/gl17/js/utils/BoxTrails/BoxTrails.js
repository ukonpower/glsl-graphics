 import comShaderPosition from './shaders/computePosition.glsl';
import comShaderVelocity from './shaders/computeVelocity.glsl';
import frag from './shaders/boxTrails.fs';
import vert from './shaders/boxTrails.vs';

import GPUComputationRenderer from '../../plugins/GPUComputationRenderer';

export default class boxTrails{

    constructor(renderer,num,length){
        this.renderer = renderer;

        this.computeRenderer;
        this.num = num;
        this.length = length;
        
        this.obj;

        this.time = 0;
        this.clock = new THREE.Clock();

        this.comTexs = {
            position:{
                texture: null,
                uniforms: null,
            },
            velocity:{
                texture: null,
                uniforms: null,
            },
        }

        this.initComputeRenderer();
        this.createTrails();
    }

    initComputeRenderer(){        
        this.computeRenderer = new GPUComputationRenderer(this.length,this.num,this.renderer);
        
        let initPositionTex = this.computeRenderer.createTexture();
        let initVelocityTex = this.computeRenderer.createTexture();

        this.initPosition(initPositionTex);
    
        this.comTexs.position.texture = this.computeRenderer.addVariable("texturePosition",comShaderPosition,initPositionTex);
        this.comTexs.velocity.texture = this.computeRenderer.addVariable("textureVelocity",comShaderVelocity,initVelocityTex);

        this.computeRenderer.setVariableDependencies( this.comTexs.position.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );
        this.comTexs.position.uniforms = this.comTexs.position.texture.material.uniforms;

        this.computeRenderer.setVariableDependencies( this.comTexs.velocity.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );  
        this.comTexs.velocity.uniforms = this.comTexs.velocity.texture.material.uniforms;
        this.comTexs.velocity.uniforms.time =  { type:"f", value : 0};

        this.computeRenderer.init();
    }

    initPosition(tex){
        var texArray = tex.image.data;
        let range = new THREE.Vector3(10,10,10);
        for(var i = 0; i < texArray.length; i += this.length * 4){
            let x = Math.random() * range.x - range.x / 2;
            let y = Math.random() * range.y - range.y / 2;
            let z = Math.random() * range.z - range.z / 2;
            for(let j = 0; j < this.length * 4; j += 4){
                texArray[i + j + 0] = x;
                texArray[i + j + 1] = y;
                texArray[i + j + 2] = z;
                texArray[i + j + 3] = 0.0;
            }
        }
    }

    createTrails(){
        let geo = new THREE.BufferGeometry();

        let posArray = [];
        let indexArray = [];
        let normalArray = [];
        let uvArray = []; 

        let r = .3;
        let res = 4;
        let space = 0.1;
        for(let i = 0; i < this.num; i++){
            for(let j = 0; j < this.length; j++){
                let cNum = i * this.length + j;

                for(let k = 0; k < res; k++){
                    let rad = Math.PI * 2 / res * k;
                    let x = Math.cos(rad) * r;
                    let y = Math.sin(rad) * r;
                    let z = space * k;
                    
                    posArray.push(x);
                    posArray.push(y);
                    posArray.push(z);

                    let v = new THREE.Vector3(x,y,z);
                    v = v.normalize();
                    normalArray.push(v.x);
                    normalArray.push(v.y);
                    normalArray.push(v.z);
    
                    uvArray.push(j / this.length);
                    uvArray.push(i / this.num);
    
                    
                    let maxIndex = this.length * res + this.length * res * i;
                    // console.log(maxIndex);
                    
                    let c = cNum * 4 + k;
                    
                    console.log(c);
                    
                    indexArray.push(c);
                    indexArray.push(Math.min(Math.max(0,c - res),maxIndex));
                    indexArray.push(Math.min(Math.max(0,c - res + 1),maxIndex));
                }
            }
        }

        let pos = new Float32Array(posArray);
        let indices = new Uint32Array(indexArray);
        let uv = new Float32Array(uvArray);
        let normal = new Float32Array(normalArray);

        let max = this.length * this.n;

        geo.addAttribute('position', new THREE.BufferAttribute( pos, 3 ) );
        geo.addAttribute('normal', new THREE.BufferAttribute( normal, 3 ) );
        geo.addAttribute('uv', new THREE.BufferAttribute( uv, 2 ) );
        geo.setIndex(new THREE.BufferAttribute(indices,1));

        console.log(geo);
        
        let customUni = {
            texturePosition : {value: null},
            textureVelocity : {value: null},
            uvDiff: {value: 1 / this.length}
        }

        let phong = THREE.ShaderLib.standard;
        this.uni = THREE.UniformsUtils.merge([phong.uniforms, customUni]);

        let mat = new THREE.ShaderMaterial({
            uniforms: this.uni,
            vertexShader: vert,
            // fragmentShader: phong.fragmentShader,
            fragmentShader: frag,
            lights:true,
        });
        this.obj = new THREE.Mesh(geo,mat);
        this.obj.matrixAutoUpdate = false;
        this.obj.updateMatrix();
    }

    update(){
        this.time += this.clock.getDelta();
        this.computeRenderer.compute();
        this.comTexs.velocity.uniforms.time.value = this.time;
        this.uni.texturePosition.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.position.texture).texture;
        this.uni.textureVelocity.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.velocity.texture).texture;
    }
}