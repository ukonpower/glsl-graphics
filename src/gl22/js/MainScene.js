import {BaseScene} from './utils/ore-three/';
import Voxel from './utils/Voxel';

export default class MainScene extends BaseScene {
    constructor(renderer) {
        super(renderer);
        this.init();
    }

    init() {
        this.camera.position.set(0,1.5,5);
        this.camera.lookAt(0,0,0);

        this.light = new THREE.DirectionalLight();
        this.light.position.y = 10;
        this.light.position.z = 10;
        this.scene.add(this.light);

        this.alight = new THREE.AmbientLight();
        this.alight.position.y = 10;
        this.scene.add(this.alight);

        this.voxel = new Voxel(this.renderer,1,10);
        this.scene.add(this.voxel.obj);
        window.scene = this.scene;
    }

    animate() {
        this.voxel.obj.rotateY(0.05);
        this.voxel.update();
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