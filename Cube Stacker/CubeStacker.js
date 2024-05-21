import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}

class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
        this.arrays.position = Vector3.cast(
            [-1, -1, 1],[-1, 1, 1], [-1,1,1],[1,1,1], [1,1,1],[1,-1,1], [1,-1,1],[-1,-1,1], //front face
            [-1,1,1],[-1,1,-1], [-1,1,-1],[-1,-1,-1], [-1,-1,-1],[-1,-1,1], //left face
            [1,1,1],[1,1,-1], [1,1,-1],[-1,1,-1],//top face
            [1,1,-1],[1,-1,-1], [1,-1,-1],[1,-1,1], //right face
            [-1,-1,-1],[1,-1,-1] //back and bot face
        );
        this.arrays.color = [
            vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),
            vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),
            vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),
            vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),
            vec4(255,255,255,1),vec4(255,255,255,1)
        ];
        this.indices = false
    }
}

class Cube_Single_Strip extends Shape {
    constructor() {
        super("position", "normal");
        // TODO (Requirement 6)
        this.arrays.position = Vector3.cast(
            [-1,1,1],[1,1,1],[-1,-1,1],[1,-1,1],[-1,1,-1],[1,1,-1],[-1,-1,-1],[1,-1,-1]
        );
        this.arrays.normal = Vector3.cast(
            [-1,1,1],[1,1,1],[-1,-1,1],[1,-1,1],[-1,1,-1],[1,1,-1],[-1,-1,-1],[1,-1,-1]
        );
        this.indices.push(0,2,1,3,5,7,4,6,0,2,3,7,5,4,1,0);
    }
}


class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        this.ol = false; //controls display outline for the cubes
        this.place = false;
        this.colors = [hex_color("#1a9ffa"), hex_color("#1a9ffa"), hex_color("#1a9ffa"), hex_color("#1a9ffa"),
                        hex_color("#1a9ffa"),hex_color("#1a9ffa"),hex_color("#1a9ffa"),hex_color("#1a9ffa")]; //colors for each cube
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
            'outline': new Cube_Outline(),
            'strip': new Cube_Single_Strip(),
            ball: new defs.Subdivision_Sphere(4),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test: new Material(new defs.Phong_Shader(),
                {ambient: 0.1, diffusivity: 1, specularity: 1, color: hex_color("#1a9ffa")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, -20, -80));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        // const light_position = vec4(0, 5, 5, 1);
        // program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class CubeStacker extends Base_Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
    constructor() {
        super();
        this.set_colors();
        this.next = vec3 (5,5,5);
        this.scaling_factor = 1/5;
        this.counter = 0;
        this.transforms = [];
    }

    set_colors() {
        let new_color = color(Math.random(), Math.random(), Math.random(),1.0);
        this.colors[0] = new_color;
        let pre_color = new_color;
        for(let i = 1; i < this.colors.length; i++){
            new_color = color(Math.random(), Math.random(), Math.random(),1.0);
            while(new_color === pre_color){
                new_color = color(Math.random(), Math.random(), Math.random(),1.0);
            }
            this.colors[i] = new_color;
            pre_color = new_color;
        }
        // TODO:  Create a class member variable to store your cube's colors.
        // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
        // Hint2: You can consider add a constructor for class CubeStacker, or add member variables in Base_Scene's constructor.
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        // Add a button for controlling the scene.
        this.key_triggered_button("Outline", ["o"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.ol = !this.ol;
        });
        this.key_triggered_button("Sit still", ["m"], () => {
            // TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off.
            this.hover = !this.hover;
        });
        this.key_triggered_button("Place", ["p"], () => {
            this.place = true;
        });
    }

    draw_box(context, program_state, model_transform, color, i) {
        // TODO:  Helper function for requirement 3 (see hint).
        //        This should make changes to the model_transform matrix, draw the next box, and return the newest model_transform.
        // Hint:  You can add more parameters for this function, like the desired color, index of the box, etc
        let t = this.t = program_state.animation_time / 1000
        let angle = 0.025*Math.PI+.025*Math.PI*Math.sin((Math.PI)*t)
        if(this.hover){
            t = 0;
            angle = 0.05*Math.PI
        }

        model_transform = model_transform.times(Mat4.translation(0,3,0))
            .times(Mat4.translation(-1,-1.5,0))
            .times(Mat4.translation(1, 1.5,0))
            .times(Mat4.scale(1, 1.5, 1));

        if(this.ol){
            this.shapes.outline.draw(context, program_state, model_transform, this.white, "LINES");
        }
        else{
            if(i % 2 == 1){
                this.shapes.strip.draw(context, program_state, model_transform, this.materials.plastic.override({color:color}), "TRIANGLE_STRIP");
            }
            else{
                this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color: color}));
            }
        }
        model_transform = model_transform.times(Mat4.scale(1,1/1.5,1));
        return model_transform;
    }

    display(context, program_state) {
        super.display(context, program_state);
        const blue = hex_color("#1a9ffa");
        const white = hex_color("#ffffff");
        let model_transform = Mat4.identity();
        // Example for drawing a cube, you can remove this line if needed
        model_transform = model_transform.times(Mat4.scale(5, 5, 5));
        let t = this.t = program_state.animation_time / 1000
        let ball_transform = Mat4.identity().times(Mat4.rotation(t,0,1,0)).times(Mat4.translation(20,0,0)).times(Mat4.scale(5,5,5));
        const light_pos = vec4 (1, 10, 5, 1);
        light_pos[0] = 10*Math.sin(t);
        program_state.lights = [new Light(light_pos, white, 10000)];
        this.shapes.ball.draw(context,program_state, ball_transform, this.materials.test.override({color:white}));
        if(this.ol){
            this.shapes.outline.draw(context, program_state, model_transform, this.white, "LINES");
        }
        else{
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test);
        }
        let desired = model_transform.times(Mat4.translation(0, 2, 5));
        desired = Mat4.inverse(desired)
        program_state.camera_inverse = desired;
        //5.2 because we scale the cube by 1/5, so it is 5 + 1*0.2 = 5.2
        let new_block_transform = Mat4.identity().times(Mat4.translation(2*Math.sin(t),this.next[1]+this.scaling_factor,0)).times(Mat4.scale(this.next[0],this.scaling_factor,this.next[2]));
        this.shapes.cube.draw(context, program_state, new_block_transform, this.materials.plastic.override({color:white}));
        if(this.place){
            let current_pos = 2*Math.sin(t)
            let place_block_transform = Mat4.identity().times(Mat4.translation(current_pos,this.next[1]+this.scaling_factor,0)).times(Mat4.scale(this.next[0],this.scaling_factor,this.next[2]));
            this.transforms.push(place_block_transform);
            this.next[1] = this.next[1]+this.scaling_factor
            this.counter = this.counter + 1
            this.place = false
        }
        if(this.counter !== 0){
            for (let i = 0; i < this.counter; i++){
                console.log(this.transforms)
                this.shapes.cube.draw(context, program_state, this.transforms[i], this.materials.plastic.override({color:white}));
            }
        }
        // model_transform = model_transform.times(Mat4.scale(1,1/1.5,1));
        // for (let i = 1; i <= 5; i++){
        //     model_transform = this.draw_box(context, program_state, model_transform, blue);
        // }
    }
}