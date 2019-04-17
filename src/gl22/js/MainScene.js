import {BaseScene} from './utils/ore-three/';
import CubeBox from './utils/voxel-cube';
import PostProcessing from './utils/post-processing';

export default class MainScene extends BaseScene {
    constructor(renderer) {
        super(renderer);
        this.init();
    }

    init() {
        this.camera.position.set(0,2,8);
        this.camera.lookAt(0,0,0);

        this.light = new THREE.DirectionalLight();
        this.light.position.y = 10;
        this.light.position.z = 5;
        this.light.intensity = 2.5;
        this.scene.add(this.light);

        this.alight = new THREE.AmbientLight();
        this.alight.intensity = 1.5;
        this.alight.position.y = 10;
        this.scene.add(this.alight);

        this.pLight = new THREE.PointLight();
        this.pLight.position.set(0,0,-3);
        this.pLight.intensity = 0;
        this.scene.add(this.pLight);

        this.voxel = new CubeBox(4,22);
        this.scene.add(this.voxel.obj);

        this.pp = new PostProcessing(this.renderer,this.scene,this.camera);
        window.scene = this.scene;
    }

    animate() {
        this.voxel.obj.rotateY(0.01);
        this.voxel.update(this.deltaTime);
        this.pp.render();
        // this.renderer.render(this.scene,this.camera);
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