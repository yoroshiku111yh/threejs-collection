import * as THREE from 'three';
import SceneBase from '../../ultilities/sceneBase';
import { clearColorDark } from '../../ultilities/variable';
import ShaderParticlesTravelling from '../../../shaders/particlesTravelling/index';

export default class SceneParticlesTravelling extends SceneBase {
    constructor({$container, size = {}, svgPaths, svgSize = {width : 0, height : 0}, options = {}, bgMap = {}}){
        super($container, size.width, size.height);
        this.svgPaths = svgPaths;
        this.svgSize = svgSize;
        this.options = options;
        this.bgMap = bgMap;
        this.init();
    }
    init(){
        this.start();
        this.initPerspectiveCamera();
        this.renderer.setClearColor(0x000);
        this.getData();
        this.createMapBg();
        this.createPlanePoints();
        this.update();
    }
    initPerspectiveCamera(){
        this.camera = new THREE.PerspectiveCamera(70, this.W/ this.H, 100, 10000);
        this.camera.position.set(0, 0, this.options.cameraZ);
        this.mainScene.add(this.camera);
    }
    updateCallback(){
        this.updateThings();
    }
    createPlanePoints(){
        this.geo = new THREE.BufferGeometry();
        const mat = new ShaderParticlesTravelling({});
        this.max = this.lines.length * 100;
        this.opacity = new Float32Array(this.max);
        this.positions = new Float32Array(this.max*3);

        for(let i = 0; i < this.max; i++){
            this.opacity.set([Math.random()/this.options.bright], i);
            this.positions.set([Math.random()*100, Math.random()*100, 0], i*3);
        }
        this.geo.setAttribute('position', new THREE.BufferAttribute( this.positions, 3));
        this.geo.setAttribute('opacity', new THREE.BufferAttribute( this.opacity, 1));
        this.plane = new THREE.Points( this.geo, mat );
        this.mainScene.add(this.plane);
    }
    getData(){
        this.lines = [];
        this.svgPaths.forEach((path, j) => {
            let len = path.getTotalLength();
            let numberOfPoints = Math.floor(len/ 5);
            let points = [];
            for (let i = 0; i < numberOfPoints; i++) {
                let pointAt = len * i/numberOfPoints;
                let p = path.getPointAtLength(pointAt);
                let randX = (Math.random() - 0.5)*3.5;
                let randY = (Math.random() - 0.5)*3.5;
                points.push(new THREE.Vector3(p.x - this.svgSize.width/2 + randX, p.y - this.svgSize.height/2 + randY, 0.));
            }
            this.lines.push({
                id : j,
                path : path,
                length : len,
                number : numberOfPoints,
                points : points,
                currentPos : 0.0,
                speed : this.options.speed || 1.0
            });
        });
    }
    updateThings(){
        let j = 0;
        this.lines.forEach(line => {
            line.currentPos += line.speed;
            line.currentPos = line.currentPos%line.length;
            for(let i = 0; i < 100; i++){
                let index = (line.currentPos + i)%line.number;
                let p = line.points[index];
                if(!p) {
                    line.currentPos = 0.0;
                    continue;
                };
                this.positions.set([p.x, p.y, p.z], j*3);
                this.opacity.set([i/(100*this.options.bright)],j);
                j++;
            }
        })
        this.geo.attributes.position.array = this.positions;
        this.geo.attributes.position.needsUpdate = true;
    }
    createMapBg(){
        const geo = new THREE.PlaneBufferGeometry(this.bgMap.size.width, this.bgMap.size.height, 1, 1);
        const texture = new THREE.TextureLoader().load(this.bgMap.src);
        texture.flipY = false;
        const mat = new THREE.MeshBasicMaterial({
            color : new THREE.Color(0x323236),
            map : texture
        });
        this.mapBg = new THREE.Mesh(geo, mat);

        this.mainScene.add(this.mapBg);
    }
}