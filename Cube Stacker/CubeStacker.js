import {defs, tiny} from './examples/common.js';
import { Text_Line } from "./examples/text-demo.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene, Texture
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
            text: new Text_Line(35)
        };
        this.camera_matrix = Mat4.translation(0, -8, -40).times(Mat4.rotation(0.5,1,0,0)).times(Mat4.rotation(0.8,0,1,0));

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test: new Material(new defs.Phong_Shader(),
                {ambient: 0.1, diffusivity: 1, specularity: 1, color: hex_color("#1a9ffa")}),
            text: new Material(new defs.Textured_Phong(1), {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")
            }),
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
            program_state.set_camera(this.camera_matrix);
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
        this.scaling_factor = 0.5;
        //This is done to avoid having to have a separate condition for the 0th one
        //Rather than just adding the scaling factor in that one case, we can still multiply
        //by two since it's just adding twice, so if we subtract once we get the same result
        this.next = vec3 (5,5-this.scaling_factor,5);
        this.counter = 0;
        this.place_transforms = [];
        this.cut_transforms = [];
        this.light_pos = vec4 (1, 10, 5, 1);
        this.title_height = 22;
        this.counter_height = 18;
        this.prev_z = 0;
        this.prev_x = 0;
        this.white_color = hex_color("#ffffff");
        this.blue_color = hex_color("#1a9ffa");
        this.replay = false;
        this.gameover = false;
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
    }

    make_control_panel() {
        this.key_triggered_button("Place", ["e"], () => {
            this.place = true;
        });
        this.key_triggered_button("Replay", ["q"], () => {
                this.replay = true;
        });
    }

    display(context, program_state) {
        
        //game over is this.next[0] or this.next[2] <= 0
        if (this.next[0] <= 0 || this.next[2] <= 0) {
            this.gameover = true;
        }

        if(this.gameover === true && this.replay === false){
            this.draw_end_screen(context, program_state);
            return;
        }
        else if(this.replay === true){
            this.replay = false;
            this.gameover = false;
            this.next = vec3 (5,5-this.scaling_factor,5);
            this.counter = 0;
            this.place_transforms = [];
            this.cut_transforms = [];
            this.light_pos = vec4 (1, 10, 5, 1);
            this.title_height = 22;
            this.counter_height = 18;
            this.prev_z = 0;
            this.prev_x = 0;
            this.camera_matrix = Mat4.translation(0, -8, -40).times(Mat4.rotation(0.5,1,0,0)).times(Mat4.rotation(0.8,0,1,0));
        }
        //draw the base game
        this.draw_base_game(context, program_state);
        let current_pos = 10*Math.sin(2*this.t);
        let new_block_transform = Mat4.identity();

        if(this.counter % 2 === 0){
            new_block_transform = new_block_transform.times(Mat4.translation(this.prev_x,this.next[1]+this.scaling_factor*2,current_pos)).times(Mat4.scale(this.next[0],this.scaling_factor,this.next[2]));
        }
        else {
            new_block_transform = new_block_transform.times(Mat4.translation(current_pos,this.next[1]+this.scaling_factor*2,this.prev_z)).times(Mat4.scale(this.next[0],this.scaling_factor,this.next[2]));
        }

        this.move_cut_blocks();
        this.counter_changed = false;

        this.shapes.cube.draw(context, program_state, new_block_transform, this.materials.plastic.override({color:this.white_color}));
        if(this.place){

            this.counter_changed = true;
            this.next[1] = this.next[1]+this.scaling_factor*2;

            //this order still matters, but I pulled out some of the state change to make it easier
            let cut_block_transform = this.get_cut_block_transform(current_pos);
            let place_block_transform = this.get_place_block_transform(current_pos);

            if (this.counter %2 === 0) {
                this.prev_z = current_pos;
            }
            else {
                this.prev_x = current_pos;
            }

            //Set up everything for the placed block
            this.place_transforms.push(place_block_transform);
            this.cut_transforms.push(cut_block_transform);
            this.counter = this.counter + 1;
            this.camera_matrix = this.camera_matrix.times(Mat4.translation(0,-1*this.scaling_factor*2,0));
            this.light_pos[1] = this.light_pos[1]+this.scaling_factor*2;
            this.title_height = this.title_height+this.scaling_factor*2;
            this.counter_height = this.counter_height+this.scaling_factor*2;
            program_state.set_camera(this.camera_matrix);
            this.place = false;
        }
        
        for (let i = 0; i < this.counter; i++){
            this.shapes.cube.draw(context, program_state, this.place_transforms[i], this.materials.plastic.override({color:this.white_color}));
        }

        for (let i = 0; i < this.cut_transforms.length; i++) {
            this.shapes.cube.draw(context, program_state, this.cut_transforms[i], this.materials.plastic.override({color:this.blue_color}));
        }

        let block_transform = Mat4.identity();
        block_transform = block_transform.times(Mat4.scale(5, 5, 5));

        this.shapes.cube.draw(context, program_state, block_transform, this.materials.plastic.override({color:this.white_color}));

    }

    draw_base_game(context, program_state) {
        super.display(context, program_state);
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(5, 5, 5));
        let t = this.t = program_state.animation_time / 1000
        let ball_transform = Mat4.identity().times(Mat4.rotation(t,0,1,0)).times(Mat4.translation(20,0,0)).times(Mat4.scale(5,5,5));
        this.light_pos[0] = 10*Math.sin(2*this.t);
        program_state.lights = [new Light(this.light_pos, this.white_color, 10000)];
        let example_text = "Cube Stacker"
        let example_transform = Mat4.identity().times(Mat4.translation(-10,this.title_height,0)).times(Mat4.scale(1,1,1)).times(Mat4.rotation(-0.8,0,1,0));
        this.shapes.text.set_string(example_text,context.context);
        this.shapes.text.draw(context, program_state, example_transform, this.materials.text);
        this.shapes.ball.draw(context,program_state, ball_transform, this.materials.test.override({color:this.white_color}));
        let counter_text = this.counter.toString()
        let counter_transform = Mat4.identity().times(Mat4.translation(0,this.counter_height,0)).times(Mat4.scale(1,1,1)).times(Mat4.rotation(-0.8,0,1,0));
        this.shapes.text.set_string(counter_text,context.context);
        this.shapes.text.draw(context, program_state, counter_transform, this.materials.text);
        this.shapes.ball.draw(context,program_state, ball_transform, this.materials.test.override({color:this.white_color}));
        this.shapes.cube.draw(context, program_state, model_transform, this.materials.test);
    }

    get_place_block_transform(current_pos) {
        let place_block_transform = Mat4.identity();
        let cut_size = 0;
        if(this.counter % 2 === 0){
            cut_size = current_pos - this.prev_z;
            this.next[2] = this.next[2] - Math.abs(cut_size);
            place_block_transform = place_block_transform.times(Mat4.translation(this.prev_x,this.next[1],current_pos)).times(Mat4.scale(this.next[0],this.scaling_factor,this.next[2]));
        }
        else {
            cut_size = current_pos - this.prev_x;
            this.next[0] = this.next[0] - Math.abs(cut_size);
            place_block_transform = place_block_transform.times(Mat4.translation(current_pos,this.next[1],this.prev_z)).times(Mat4.scale(this.next[0],this.scaling_factor,this.next[2]));
        }
        return place_block_transform;
    }

    get_cut_block_transform(current_pos) {
        let cut_block_transform = Mat4.identity();
        if(this.counter % 2 === 0){
            let cut_size = current_pos - this.prev_z;
            let block_z_translate = cut_size > 0 ? current_pos + this.next[2] : current_pos - this.next[2];
            cut_block_transform = cut_block_transform.times(Mat4.translation(this.prev_x, this.next[1], block_z_translate)).times(Mat4.scale(this.next[0], this.scaling_factor, cut_size));
        }
        else {
            let cut_size = current_pos - this.prev_x;
            let block_x_translate = cut_size > 0 ? current_pos + this.next[0] : current_pos - this.next[0];
            cut_block_transform = cut_block_transform.times(Mat4.translation(block_x_translate, this.next[1], this.prev_z)).times(Mat4.scale(cut_size, this.scaling_factor, this.next[2]));
        }
        return cut_block_transform;
    }

    move_cut_blocks() {
        if (this.counter_changed) {
            console.log('--------------------------------------------------');
        }
        this.cut_transforms = this.cut_transforms.map(
            (value, i) => i % 2 === 0 ? 
            value.times(Mat4.translation(0, -0.2, 0.01)) :
            value.times(Mat4.translation(0.01, -0.2, 0)));

        this.cut_transforms = this.cut_transforms.filter((value) => value[1][3] > -10);
        // this.cut_transforms = this.cut_transforms.filter((value) => {
        //     const y_pos = value[1][3];

        // })

        for (let i = 0; i < this.cut_transforms.length; i++) {

            let y_pos = this.cut_transforms[i][1][3];
            if (this.counter_changed) {
                console.log(this.cut_transforms[i].to_string());
                console.log(y_pos);
            }
        }
    }

    //TODO: MAKE THIS SOMETHING REAL
    draw_end_screen(context, program_state) {
        this.shapes.text.set_string("Game Over",context.context);
        let example_transform = Mat4.identity().times(Mat4.translation(-10,this.title_height,0)).times(Mat4.scale(1,1,1)).times(Mat4.rotation(-0.8,0,1,0));
        this.shapes.text.draw(context, program_state, example_transform, this.materials.text);
    }
}