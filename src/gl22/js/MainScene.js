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

        this.scroll = 0.0;

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

        this.voxel = new CubeBox(3,25);
        this.scene.add(this.voxel.obj);

        this.pp = new PostProcessing(this.renderer,this.scene,this.camera);
        window.scene = this.scene;
    }

    animate() {
        this.scroll *= 0.95;
        this.voxel.obj.rotateY(0.01);
        this.voxel.obj.rotateY(this.scroll);
        this.voxel.update(this.deltaTime,this.scroll);
        this.pp.render();
        // this.renderer.render(this.scene,this.camera);
    }

    Resize(width,height){
        let aspect = width / height;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        if(aspect > 1.0){
            this.camera.position.z = 8;
        }else{
            this.camera.position.z = 13;
        }
        this.camera.lookAt(0,0,0);
    }
    
    onTouchStart(c){
        this.scroll = c.deltaX * 0.005;
    }

    onTouchMove(c){
        this.scroll = c.deltaX * 0.005;
    }

    onTouchEnd(c){
        this.scroll = c.deltaX * 0.005;
    }

}