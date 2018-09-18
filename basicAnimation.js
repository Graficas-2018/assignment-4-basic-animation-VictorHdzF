// 1. Enable shadow mapping in the renderer. 
// 2. Enable shadows and set shadow parameters for the lights that cast shadows. 
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows. 
// 3. Indicate which geometry objects cast and receive shadows.

var renderer = null, 
scene = null, 
camera = null,
root = null,
shark = null,
group = null,
orbitControls = null;

var objLoader = null;
var textureLoader = null;

var currentTime = Date.now();

var animator = null,
loopAnimation = true;

var material = new THREE.MeshPhongMaterial();

function loadObj()
{
    if(!textureLoader)
        textureLoader = new THREE.TGALoader();
    
    var t = textureLoader.load(
        // resource URL
        'models/Texture/greatwhiteshark.tga',
        // called when loading is completed
        function ( material ) {
    
            material.map = t;
            console.log( 'Texture is loaded' );
    
        },
        // called when the loading is in progresses
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when the loading failes
        function ( error ) {
    
            console.log( 'An error happened' );
    
        }
    );

    var n = textureLoader.load(
        // resource URL
        'models/Texture/greatwhiteshark_n.tga',
        // called when loading is completed
        function ( material ) {
    
            material.normalMap = n;
            console.log( 'Texture is loaded' );
    
        },
        // called when the loading is in progresses
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when the loading failes
        function ( error ) {
    
            console.log( 'An error happened' );
    
        }
    );

    if(!objLoader)
        objLoader = new THREE.OBJLoader();
        
    objLoader.load(
        'models/Shark.obj',

        function(object)
        {
            object.material = new THREE.MeshPhongMaterial({ color: 0x848484});
            object.castShadow = true;
            object.receiveShadow = true;
            object.position.set(0, 0, 0);
            object.scale.set(0.3, 0.3, 0.3);
            group.add(object);
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}

function run() {

    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Update the animations
        KF.update();

        // Update the camera controller
        orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "images/sea.jpg";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-5, 15, 20);
    scene.add(camera);
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(.5, 0, 3);
    root.add(directionalLight);

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(2, 8, 15);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    

    // Create the objects
    loadObj();

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    
    // Add the mesh to our group
    scene.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    
    // Now add the group to our scene
    scene.add( root );
}

function initAnimations() 
{
    animator = new KF.KeyFrameAnimator;
    
    var k = [];
    var v = [];
    var r = [];
    for (var i = 0; i <= 180; i++)
        k.push( i * (1 / 180));
    for (var j = 0; j <= 360; j += 360 / 180)
        v.push({ x: 7 * Math.cos(j * Math.PI / 180), y: 0.0, z: 7 * Math.sin(j * Math.PI / 180)});
    for (var m = 0; r.length <= 180; m -= 0.035)
        r.push({x: 0.0, y: m, z: 0.0});

    animator.init({ 
        interps:
            [
                {
                    keys:k,
                    values:v,
                    target:group.position
                },

                {
                    keys:k,
                    values:r,
                    target:group.rotation
                },
            ],
        loop: loopAnimation,
        duration: 7000,
    });
}

function playAnimations()
{
    animator.start();
}