import comShaderPosition from './shaders/computePosition.glsl';
import comShaderVelocity from './shaders/computeVelocity.glsl';

import vert from './shaders/voxel.vs';
import frag from './shaders/voxel.fs';
import shadowFrag from './shaders/voxelShadow.fs';

import GPUComputationRenderer from '../../plugins/GPUComputationRenderer';

export default class Voxel {
    constructor(renderer, width, res) {
        this.renderer = renderer;
        this.width = width;
        this.size = this.width / (res);
        this.res = res;

        this.obj;
        this.time = 0;
        this.clock = new THREE.Clock();
        this.shapes = 4;

        this.comTexs = {
            position: {
                texture: null,
                uniforms: null,
            },
            velocity: {
                texture: null,
                uniforms: null,
            }
        }

        this.initComputeRenderer();
        this.createVoxel();
    }

    initComputeRenderer() {
        this.computeRenderer = new GPUComputationRenderer(this.res * this.res, this.res, this.renderer);

        let initPosTex = this.computeRenderer.createTexture();
        let initVelocityTex = this.computeRenderer.createTexture();

        this.initPos(initPosTex);

        this.comTexs.position.texture = this.computeRenderer.addVariable("texturePosition", comShaderPosition, initPosTex);
        this.comTexs.velocity.texture = this.computeRenderer.addVariable("textureVelocity", comShaderVelocity, initVelocityTex);

        this.computeRenderer.setVariableDependencies(this.comTexs.position.texture, [this.comTexs.position.texture, this.comTexs.velocity.texture]);
        this.computeRenderer.setVariableDependencies(this.comTexs.velocity.texture, [this.comTexs.position.texture, this.comTexs.velocity.texture]);
        this.comTexs.velocity.uniforms = this.comTexs.velocity.texture.material.uniforms;
        this.comTexs.velocity.uniforms.time = {
            type: "f",
            value: 0
        };
        this.comTexs.velocity.uniforms.res = {
            type: "i",
            value: this.res
        };
        this.comTexs.velocity.uniforms.point = {
            type: "v3",
            value: new THREE.Vector3(0, 0, 0)
        };

        this.computeRenderer.init();
    }

    initPos(tex) {
        var texArray = tex.image.data;
        for (let i = 0; i < this.res; i++) {
            for (let j = 0; j < this.res; j++) {
                for (let k = 0; k < this.res; k++) {
                    let ind = (i * this.res * this.res + j * this.res + k) * 4;
                    let x = i * this.size + this.size / 2 - this.width / 2;
                    let y = j * this.size + this.size / 2 - this.width / 2;
                    let z = k * this.size + this.size / 2 - this.width / 2;

                    texArray[ind + 0] = x;
                    texArray[ind + 1] = y;
                    texArray[ind + 2] = z;
                    texArray[ind + 3] = 1.0;
                }
            }
        }
    }

    createVoxel() {
        let originBox = new THREE.BoxBufferGeometry(this.size, this.size, this.size);
        let geo = new THREE.InstancedBufferGeometry();

        let vertices = originBox.attributes.position.clone();
        geo.addAttribute('position', vertices);

        let normals = originBox.attributes.normal.clone();
        geo.addAttribute('normals', normals);

        if (originBox.index) {
            let indices = originBox.index.clone();
            geo.setIndex(indices);
        }
        let objNum = Math.pow(this.res, 3);
        let nums = new THREE.InstancedBufferAttribute(new Float32Array(objNum * 1), 1, false, 1);
        let uvs = new THREE.InstancedBufferAttribute(new Float32Array(objNum * 2), 2, false, 1);

        for (let i = 0; i < objNum; i++) {
            nums.setX(i, i);
            uvs.setX(i, (i % (this.res * this.res)) / (this.res * this.res));
            uvs.setY(i, (i / (this.res * this.res)) / this.res);
        }

        geo.addAttribute('num', nums);
        geo.addAttribute('uv', uvs);

        let cUni = {
            textureVelocity: {
                value: null
            },
            texturePosition: {
                value: null
            },
            time: {
                value: 0
            }
        }

        this.uni = THREE.UniformsUtils.merge([THREE.ShaderLib.standard.uniforms,cUni]);
        this.uni.diffuse.value = new THREE.Vector3(1.0,1.0,1.0);
        this.uni.roughness.value = 0.1;

        let mat = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: THREE.ShaderLib.standard.fragmentShader,
            uniforms: this.uni,
            flatShading: true,
            lights: true
        })

        this.obj = new THREE.Mesh(geo, mat);
        this.obj.castShadow = true;

        this.obj.customDepthMaterial = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: shadowFrag,
            uniforms: mat.uniforms
        });
        console.log(geo);

    }

    setPoint(p) {
        console.log(p);
        this.comTexs.velocity.uniforms.point.value = p;
    }

    update() {
        this.time += this.clock.getDelta();
        this.comTexs.velocity.uniforms.time.value = this.time;

        this.uni.textureVelocity.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.velocity.texture).texture;
        this.uni.texturePosition.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.position.texture).texture;
        this.uni.time.value = this.time;
        this.computeRenderer.compute();
    }
}