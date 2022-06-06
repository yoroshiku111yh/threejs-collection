var scene;
var renderer;
var camera;
var light;
var objLoader;
var morpher;
var clock;

var time = 0;

window.onload = function () {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    renderer.setSize(width, height);
    renderer.setClearColor(0x888888, 1);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 5;
    scene.add(camera);

    light = new THREE.PointLight(0xffffff);
    camera.add(light);

    objLoader = new THREE.OBJLoader();

    clock = new THREE.Clock();

    morpher = new MeshMorpher();
    morpher.addFiles(['meshes/globe.obj', 'meshes/plane.obj', 'meshes/spanner.obj', 'meshes/arrow.obj']);

    render();
}

function render() {
    requestAnimationFrame(render);

    var dt = clock.getDelta();

    // var time = clock.getElapsedTime();
    // time = (Math.sin(time)+1)/2;
    // time += dt;
    // if(time > 2){
    // time -= 2;
    // }

    // morpher.updateGeometry(time);

    renderer.render(scene, camera);
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

window.onmousemove = function (e) {
    var width = window.innerWidth - 200;
    var xPos = e.clientX - 100;

    var percent = clamp(xPos / width, 0, 1);
    if (morpher) {
        morpher.updateGeometry(percent * 3);
    }
}

window.onresize = function () {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}