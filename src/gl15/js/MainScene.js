import BaseScene from './utils/BaseScene';
import Particle from './utils/Particles/Particles';

import ppVert from './shaders/pp.vs';
import ppFrag from './shaders/pp.fs';

export default class MainScene extends BaseScene {

    constructor(renderer) {
        super(renderer);
        this.init();
        this.animate();
    }

    init() {
        this.renderer.setClearColor(0x0000ff,0);
        this.time = 0;
        this.clock = new THREE.Clock();
        this.camera.position.set(0,3,10);
        this.camera.lookAt(0,0,0);
        
        this.particles = new Particle(this.renderer,new THREE.Color(0xffffff));
        this.scene.add(this.particles.obj);
    }

    animate() {
        this.time += this.clock.getDelta();
        this.particles.update();

        this.camera.position.z = Math.sin(this.time * 0.3) * 10;
        this.camera.position.x = Math.cos(this.time * 0.3) * 10;
        this.camera.lookAt(0,0,0);
        this.renderer.render(this.scene,this.camera);
    }

    Resize(width,height){
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    
    onTouchStart(){
    }

    onTouchMove(){
    }

    onTouchEnd(){

    }

}