import BaseScene from './utils/BaseScene';
import BoxTrails from './utils/BoxTrails/BoxTrails';

import ppVert from './shaders/pp.vs';
import ppFrag from './shaders/pp.fs';

export default class MainScene extends BaseScene {

    constructor(renderer) {
        super(renderer);
        this.init();
        this.animate();
    }

    init() {
        this.time = Math.random() * 100;
        this.clock = new THREE.Clock();
        this.camera.position.set(0,1,3);

        this.light = new THREE.DirectionalLight({color:0xffffff});
        this.light.position.set(2,5,-2);
        this.light.intensity = 2;
        this.scene.add(this.light);

        // this.alight = new THREE.AmbientLight({color:0xf});
        // this.scene.add(this.alight);

        let bg = new THREE.BoxGeometry(1,1,1);
        let bm = new THREE.MeshStandardMaterial();
        this.box = new THREE.Mesh(bg,bm);
        this.scene.add(this.box);

        this.bTrails = new BoxTrails(this.renderer,2,10);
        this.scene.add(this.bTrails.obj);

        window.scene = this.scene;
    }

    animate() {
        this.time += this.clock.getDelta();

        let r = 13;
        this.camera.position.set(Math.sin(this.time * 0.5) * r,0,Math.cos(this.time * 0.5) * r);
        // this.camera.position.set(Math.sin(0) * r,0,Math.cos(0) * r);
        // this.camera.position.set(15,0,0);
        this.camera.lookAt(0,0,0);
        this.bTrails.update();

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