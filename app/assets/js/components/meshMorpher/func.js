
function MeshMorpher() {
    this.geometries = [];
    this.mesh = null;
    var self = this;

    this.vertexOffset = [];

    this.updateGeometry = function (percent) {
        if (!this.mesh) {
            return;
        }

        var firstMesh = Math.floor(percent);
        var secondMesh = Math.ceil(percent);
        if (!this.geometries[firstMesh] || !this.geometries[secondMesh]) {
            return;
        }

        while (percent > 1) {
            percent -= 1;
        }

        var vertexCount = this.mesh.geometry.vertices.length;
        var vectorMath = new THREE.Vector3();

        for (var i = 0; i < vertexCount; i++) {
            var pos1 = this.geometries[firstMesh].vertices[i].clone();
            var pos2 = this.geometries[secondMesh].vertices[i].clone();
            var tempPerc = percent + this.roundStep(percent) * this.vertexOffset[i];
            tempPerc = this.smooth(tempPerc);
            this.mesh.geometry.vertices[i].copy(vectorMath.lerpVectors(pos1, pos2, tempPerc));
        }
        this.mesh.geometry.verticesNeedUpdate = true;
        this.mesh.geometry.computeVertexNormals();
        this.mesh.geometry.computeFaceNormals();
    }

    this.addGeometry = function (geometry, pos) {
        if (pos) {
            this.geometries[pos] = geometry.clone();
        }
        else {
            this.geometries.push(geometry.clone());
        }
    }

    this.addFiles = function (urls) {
        urls.forEach(function (url, pos) {
            objLoader.load(url, function (mesh) {
                var mesh = mesh.children[0];

                var geometry = new THREE.Geometry().fromBufferGeometry(mesh.geometry);
                mesh.geometry = geometry;

                if (pos == 0) {
                    self.mesh = mesh;

                    mesh.material = new THREE.MeshPhongMaterial({ color: 0x00ada7 });
                    mesh.material.shading = THREE.FlatShading;

                    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
                        var seed = mesh.geometry.vertices[i].x + mesh.geometry.vertices[i].y;
                        self.vertexOffset[i] = self.random(seed) * 0.1 - 0.05;

                    }

                    scene.add(self.mesh);
                }

                mesh.geometry.name = url;

                self.addGeometry(mesh.geometry, pos);
            });
        });
    }

    this.smooth = function (x) {
        return -6 * Math.pow(x, 3) + 9 * Math.pow(x, 2) - 2 * x;
    }

    this.roundStep = function (x) {
        return 1 - Math.pow(1 - 2 * x, 2);
    }

    this.random = function (seed) {
        return (1103515245 * seed + 12345) % 65536 / 65536;
    }
}