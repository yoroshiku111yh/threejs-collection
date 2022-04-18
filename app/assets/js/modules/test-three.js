import { AmbientLight, BoxGeometry, CircleBufferGeometry, CircleGeometry, FrontSide, Mesh, MeshBasicMaterial, MeshLambertMaterial, Points, PointsMaterial } from 'three';
import { BufferGeometry } from 'three';
import { MathUtils } from 'three';
import { Float32BufferAttribute } from 'three';
import { DirectionalLight } from 'three';
import { WebGLRenderer, Scene, PerspectiveCamera, Color } from 'three';
import { OrbitControls } from '../../vendor/control/OrbitControls';

const cameraSetting = {
    pov : 75,
    aspect : window.innerWidth / window.innerHeight,
    near : 0.1,
    far : 1000
}

const renderSetting = {
    size : {
        width : window.innerWidth,
        height : window.innerHeight
    }
}

const scene = new Scene();
const camera = new PerspectiveCamera(cameraSetting.pov, cameraSetting.aspect, cameraSetting.near, cameraSetting.far);
const renderer = new WebGLRenderer();
renderer.setSize(renderSetting.size.width, renderSetting.size.height);

document.getElementById("three__wrapper").appendChild(renderer.domElement);

const boxGeometry = new BoxGeometry();
const materialBox = new MeshBasicMaterial( { color : 0x00ff00 } );
const cube = new Mesh(boxGeometry, materialBox);

scene.add(cube);
camera.position.z = 5;

const points = [];
const minZ = -800;
const maxZ = -150;

for(let i = 0 ; i < 360; i+=0.5){
    const {x , y} = getPositionByAngle({
        distance : Math.random()*(200 - 100 + 1) + 100,
        from : {
            x : 0,
            y : 0
        },
        radian : i*(Math.PI/180)
    });
    const particle = createParticle({
        x : x,
        y : y,
        z : Math.random()*(maxZ - minZ + 1) + minZ,
        segments : 45,
        radius : 1,
        color : 0xffff00,
        radian : i*(Math.PI/180)
    });
    points.push(particle);
    scene.add(particle);
}

for(let i = 0; i < 360; i += 5){
    const {x , y} = getPositionByAngle({
        distance : 200,
        from : {
            x : 0,
            y : 0
        },
        radian : i*(Math.PI/180)
    });
    const particle = createParticle({
        x : x,
        y : y,
        z : -500,
        segments : 45,
        radius : 1.5,
        color : 0xff0000,
        radian : i*(Math.PI/180)
    });
    scene.add(particle);
}

for(let i = 0; i < 360; i += 5){
    const {x , y} = getPositionByAngle({
        distance : 200,
        from : {
            x : 0,
            y : 0
        },
        radian : i*(Math.PI/180)
    });
    const particle = createParticle({
        x : x,
        y : y,
        z : -300,
        segments : 45,
        radius : 1.5,
        color : 0xff0000,
        radian : i*(Math.PI/180)
    });
    scene.add(particle);
}

for(let i = 0; i < 360; i += 5){
    const {x , y} = getPositionByAngle({
        distance : 200,
        from : {
            x : 0,
            y : 0
        },
        radian : i*(Math.PI/180)
    });
    const particle = createParticle({
        x : x,
        y : y,
        z : -150,
        segments : 45,
        radius : 1.5,
        color : 0xff0000,
        radian : i*(Math.PI/180)
    });
    scene.add(particle);
}

function createParticle({x, y, z, segments, radius, color, radian}){
    const geometry = new CircleGeometry(radius, segments);
    const material = new MeshBasicMaterial({color : color});
    const circle = new Mesh(geometry, material);
    //
    circle.position.x = x;
    circle.position.y = y;
    circle.position.z = z;
    circle.radian = radian;
    circle.defaultPosition = {
        x : x,
        y : y
    }
    return circle;
}

function getPositionByAngle({radian, distance, from}){
    const x = distance*Math.cos(radian) + from.x;
    const y = distance*Math.sin(radian) + from.y;
    return {
        x : x,
        y : y
    }
}

function animate(){
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
    renderer.render(scene, camera);
    for(let i = 0; i < points.length ; i++){
        const point = points[i];
        const v_x = Math.cos(point.radian)*.5;
        const v_y = Math.sin(point.radian)*.5
        point.position.x += v_x;
        point.position.y += v_y;
        if(point.position.x > renderSetting.size.width/2 
            || point.position.x < -renderSetting.size.width/2
            || point.position.y > renderSetting.size.height/2
            || point.position.y < -renderSetting.size.height/2){
            point.position.x = point.defaultPosition.x;
            point.position.y = point.defaultPosition.y;
        }
        
    }
}

animate();

export default class EmptyClass{}