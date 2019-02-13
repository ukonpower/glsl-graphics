const { Vector3, Vector4, Matrix4 } = require('matrixgl');
const GLPower = require('./glPower')

const screenVert = require('../shader/screen.vs');
const renderFrag = require('../shader/render.fs');

const boxVert = require('../shader/box.vs');
const boxFrag = require('../shader/box.fs');

class APP{
    constructor(){
        this.canvas = document.getElementById("canvas");    
        let dpr = window.devicePixelRatio || 1;
        // dpr = 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gl = canvas.getContext('webgl');
        this.glp = new GLPower(this.gl);

        this.time = 0;

        this.init();
        this.animate();
    }

    init(){
        let screenParam = {
            attributes: {
                position:{
                    vertices: this.glp.screen.vertices,
                    stride: 3,
                    index: this.glp.screen.index
                },
            },
            vertex: screenVert,
            fragment: renderFrag,
            uniforms: {
                time: {type: "uniform1f",value: 0},
                texture: {type: "uniform1i", value: null},
                resolution:{type: "uniform2fv",value: [this.width,this.height]}
            }
        }
        this.screen = this.glp.cObject(screenParam);

        let boxGeo = [];
        let n = 10;
        let sp = 1 / (n - 1);

        for(let i = 0; i < n; i++){
            for(let j = 0; j < n; j++){
                for(let k = 0; k < n; k++){
                    boxGeo.push(-0.5 + i * sp);
                    boxGeo.push(-0.5 + j * sp);
                    boxGeo.push(-0.5 + k * sp);
                }
            }
        }

        let boxParam = {
            attributes: {
                position:{
                    vertices: boxGeo,
                    stride: 3,
                    index: this.glp.screen.index
                },
            },
            vertex: boxVert,
            fragment: boxFrag,
            uniforms: {
                mvp: {type: "uniformMatrix4fv", value: 0},
                time: {type: "uniform1f",value: 0},
            }
        }
        this.box = this.glp.cObject(boxParam);
        this.fbuffer = this.glp.cFbuffer(this.canvas.width,this.canvas.height,0,false);
    }

    animate(){
        this.time += 0.01666;
        const view = Matrix4.lookAt(new Vector3(0,1,2),new Vector3(0,0,0),new Vector3(0,1,0));

        const perspective = Matrix4.perspective({
            fovYRadian: 60 * Math.PI / 180,
            aspectRatio: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 10
        });

        const transform = Matrix4.identity().rotateY(this.time * 0.1).scale(1,1,1);
        const mvp = perspective.mulByMatrix4(view).mulByMatrix4(transform);

        this.glp.selectFramebuffer(this.fbuffer);
        this.box.uniforms.mvp.value = mvp.values;
        this.glp.draw(this.box,"POINT");

        this.glp.selectFramebuffer(null);
        this.screen.uniforms.time.value = this.time;
        this.screen.uniforms.texture.value = this.fbuffer.texUnit;
        this.glp.draw(this.screen,"MESH");

        requestAnimationFrame(this.animate.bind(this));
    }
}

window.addEventListener('load',() =>{
    var app = new APP();
});
