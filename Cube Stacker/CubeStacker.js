import {defs, tiny} from './examples/common.js';
import { Text_Line } from "./examples/text-demo.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

// class Cube extends Shape {
//     constructor() {
//         super("position", "normal",);
//         // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
//         this.arrays.position = Vector3.cast(
//             [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
//             [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
//             [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
//         this.arrays.normal = Vector3.cast(
//             [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
//             [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
//             [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
//         // Arrange the vertices into a square shape in texture space too:
//         this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
//             14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
//     }
// }
//
// class Cube_Outline extends Shape {
//     constructor() {
//         super("position", "color");
//         //  TODO (Requirement 5).
//         // When a set of lines is used in graphics, you should think of the list entries as
//         // broken down into pairs; each pair of vertices will be drawn as a line segment.
//         // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
//         this.arrays.position = Vector3.cast(
//             [-1, -1, 1],[-1, 1, 1], [-1,1,1],[1,1,1], [1,1,1],[1,-1,1], [1,-1,1],[-1,-1,1], //front face
//             [-1,1,1],[-1,1,-1], [-1,1,-1],[-1,-1,-1], [-1,-1,-1],[-1,-1,1], //left face
//             [1,1,1],[1,1,-1], [1,1,-1],[-1,1,-1],//top face
//             [1,1,-1],[1,-1,-1], [1,-1,-1],[1,-1,1], //right face
//             [-1,-1,-1],[1,-1,-1] //back and bot face
//         );
//         this.arrays.color = [
//             vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),
//             vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),
//             vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),
//             vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),vec4(255,255,255,1),
//             vec4(255,255,255,1),vec4(255,255,255,1)
//         ];
//         this.indices = false
//     }
// }
//
// class Cube_Single_Strip extends Shape {
//     constructor() {
//         super("position", "normal");
//         // TODO (Requirement 6)
//         this.arrays.position = Vector3.cast(
//             [-1,1,1],[1,1,1],[-1,-1,1],[1,-1,1],[-1,1,-1],[1,1,-1],[-1,-1,-1],[1,-1,-1]
//         );
//         this.arrays.normal = Vector3.cast(
//             [-1,1,1],[1,1,1],[-1,-1,1],[1,-1,1],[-1,1,-1],[1,1,-1],[-1,-1,-1],[1,-1,-1]
//         );
//         this.indices.push(0,2,1,3,5,7,4,6,0,2,3,7,5,4,1,0);
//     }
// }

class Bounding_Box {
    constructor(x_min, x_max, z_min, z_max) {
        this.x_min = x_min;
        this.x_max = x_max;
        this.z_min = z_min;
        this.z_max = z_max;
    }

    get minX() {
        return this.x_min;
    }

    get maxX() {
        return this.x_max;
    }

    get minZ() {
        return this.z_min;
    }

    get maxZ() {
        return this.z_max;
    }

    collides(box) {
        return (
            this.x_min <= box.maxX &&
            this.x_max >= box.minX &&
            this.z_min <= box.maxZ &&
            this.z_min >= box.minZ
          );
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
        this.c = 0;
        this.colors = [hex_color("#1a9ffa"), hex_color("#1a9ffa"), hex_color("#1a9ffa"), hex_color("#1a9ffa"),
                        hex_color("#1a9ffa"),hex_color("#1a9ffa"),hex_color("#1a9ffa"),hex_color("#1a9ffa")]; //colors for each cube
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
            // 'outline': new Cube_Outline(),
            // 'strip': new Cube_Single_Strip(),
            ball: new defs.Subdivision_Sphere(4),
            text: new Text_Line(35)
        };
        this.initial_camera_location = Mat4.translation(0, -8, -40).times(Mat4.rotation(0.5,1,0,0)).times(Mat4.rotation(0.8,0,1,0));
        this.camera_matrix = this.initial_camera_location;
        this.desired = this.initial_camera_location;

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 1, color: hex_color("#1a9ffa")}),
            text: new Material(new defs.Textured_Phong(1), {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")
            }),
            stars_p: new Material(new Texture_W(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/stars.png","NEAREST")
            }),
            a: new Material(new Texture_W(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/1.png","NEAREST")
            }),
            b: new Material(new Texture_W(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/2.jpg","NEAREST")
            }),
            c: new Material(new Texture_W(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/3.jpg","NEAREST")
            }),
            d: new Material(new Texture_W(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/4.jpg","NEAREST")
            }),
            e: new Material(new Texture_W(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/5.jpg","NEAREST")
            }),
            f: new Material(new Texture_B(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/6.jpg","NEAREST")
            }),
            g: new Material(new Texture_B(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/7.jpg","NEAREST")
            }),
            h: new Material(new Texture_B(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/8.jpg","NEAREST")
            }),
            i: new Material(new Texture_B(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/9.jpg","NEAREST")
            }),
            j: new Material(new Texture_B(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/10.jpg","NEAREST")
            }),
            k: new Material(new Texture_W(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/11.jpg","NEAREST")
            }),
            l: new Material(new Texture_W(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/12.jpg","NEAREST")
            }),
            n: new Material(new Texture_B(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/13.jpg","NEAREST")
            }),
            m: new Material(new Texture_B(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/14.jpg","NEAREST")
            }),
            o: new Material(new Texture_B(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/15.jpg","NEAREST")
            }),
            p: new Material(new Texture_B(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/16.jpg","NEAREST")
            }),
            ground: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/ground.jpg","NEAREST")
            }),
            street: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),  // <-- changed base color to black
                ambient: 1.0,  // <-- changed ambient to 1
                texture: new Texture("assets/street.jpg","NEAREST")
            }),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        // if (!context.scratchpad.controls) {
        //    //this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
        //     // Define the global camera and projection matrices, which are stored in program_state.
        //     this.camera_matrix = this.camera_matrix.map((x,i) => Vector.from(program_state.camera_transform[i]).mix(x, 0.001));
        //     program_state.set_camera(this.camera_matrix);
        //     //this.camera_matrix = this.camera_matrix.map((x,i) => Vector.from(program_state.camera_transform[i]).mix(x, 0.001));
        // }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);
        this.camera_matrix = this.camera_matrix.map((x,i) => Vector.from(this.desired[i]).mix(x, 0.9));
        //this.camera_matrix = this.camera_matrix.times(0.9).plus(this.desired.times(0.1));
        program_state.set_camera(this.camera_matrix);

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
        this.scaling_factor = 0.8;
        //This is done to avoid having to have a separate condition for the 0th one
        //Rather than just adding the scaling factor in that one case, we can still multiply
        //by two since it's just adding twice, so if we subtract once we get the same result
        this.next = vec3 (5,5-this.scaling_factor,5);
        this.counter = 0;
        this.place_transforms = [];
        this.cut_transforms = [];
        this.textures = [this.materials.stars_p, this.materials.a, this.materials.b, this.materials.c, this.materials.d, this.materials.e,
            this.materials.f, this.materials.g,this.materials.h, this.materials.i, this.materials.j,
            this.materials.k, this.materials.l,this.materials.m, this.materials.n, this.materials.o,
            this.materials.p];
        this.block_textures = [];
        this.light_pos = vec4 (1, 10, 5, 1);
        this.title_height = 22;
        this.counter_height = 18;
        this.prev_z = 0;
        this.prev_x = 0;
        this.white_color = hex_color("#ffffff");
        this.blue_color = hex_color("#1a9ffa");
        this.bounding_boxes = [];
        this.bounding_boxes.push(new Bounding_Box(-5, 5, -5, 5));
        this.replay = false;
        this.gameover = false;
        this.min = 1
        this.max = 16
        this.range = this.max - this.min
        this.placed = false;
        this.current_number = Math.round(Math.random() * this.range) + this.min
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
        this.control_panel.innerHTML += "Instructions:";
        this.new_line();
        this.control_panel.innerHTML += "1. Press 'p' to place a block.";
        this.new_line();
        this.control_panel.innerHTML += "2. Press 'r' to restart the game.";
        this.new_line();
        this.key_triggered_button("Place", ["p"], () => {
            this.place = true;
        });
        this.key_triggered_button("Replay", ["r"], () => {
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
            this.block_textures = [];
            this.current_number = Math.round(Math.random() * this.range) + this.min
            this.light_pos = vec4 (1, 10, 1, 1);
            this.title_height = 22;
            this.counter_height = 18;
            this.prev_z = 0;
            this.prev_x = 0;
            this.desired = this.initial_camera_location;
            this.camera_matrix = this.initial_camera_location;
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
        this.shapes.cube.draw(context, program_state, new_block_transform, this.textures[this.current_number]);
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

            //determine the texture to use
            this.block_textures.push(this.current_number)
            //Set up everything for the placed block
            this.place_transforms.push(place_block_transform);
            this.cut_transforms.push(cut_block_transform);
            this.counter = this.counter + 1;
            this.desired = this.camera_matrix.times(Mat4.translation(0,-1*this.scaling_factor*2,0));
            //this.camera_matrix = this.desired;
            //program_state.set_camera(desired);
            this.light_pos[1] = this.light_pos[1]+this.scaling_factor*2;
            this.title_height = this.title_height+this.scaling_factor*2;
            this.counter_height = this.counter_height+this.scaling_factor*2;
            this.place = false;
            this.current_number = Math.round(Math.random() * this.range) + this.min;
        }

        for (let i = 0; i < this.counter; i++){
            this.shapes.cube.draw(context, program_state, this.place_transforms[i], this.textures[this.block_textures[i]]);
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
        // let ball_transform = Mat4.identity().times(Mat4.rotation(t,0,1,0)).times(Mat4.translation(20,0,0)).times(Mat4.scale(5,5,5));
        if (this.counter %2 === 0) {
            this.light_pos[0] = 1
            this.light_pos[3] = 5
        }
        else {
            this.light_pos[0] = 1
            this.light_pos[3] = 5
        }
        program_state.lights = [new Light(this.light_pos, this.white_color, 100)];
        let example_text = "Cube Stacker"
        let example_transform = Mat4.identity().times(Mat4.translation(-10,this.title_height,0)).times(Mat4.scale(1,1,1)).times(Mat4.rotation(-0.8,0,1,0));
        this.shapes.text.set_string(example_text,context.context);
        this.shapes.text.draw(context, program_state, example_transform, this.materials.text);
        // this.shapes.ball.draw(context,program_state, ball_transform, this.materials.test.override({color:this.white_color}));
        let counter_text = this.counter.toString()
        let counter_transform = Mat4.identity().times(Mat4.translation(0,this.counter_height,0)).times(Mat4.scale(1,1,1)).times(Mat4.rotation(-0.8,0,1,0));
        this.shapes.text.set_string(counter_text,context.context);
        this.shapes.text.draw(context, program_state, counter_transform, this.materials.text);
        // this.shapes.ball.draw(context,program_state, ball_transform, this.materials.test.override({color:this.white_color}));
        this.shapes.cube.draw(context, program_state, model_transform, this.textures[0]);
        let model_trans_floor = Mat4.translation(0,-5,0).times(Mat4.scale(40, 0.01, 40));
        this.shapes.cube.draw(context, program_state, model_trans_floor, this.materials.ground);
        let model_trans_wall1 = Mat4.translation(0,35,-35).times(Mat4.scale(40, 50, 1));
        this.shapes.cube.draw(context, program_state, model_trans_wall1, this.materials.street);
        let model_trans_wall2 = Mat4.translation(35,35,0).times(Mat4.scale(1, 50, 40));
        this.shapes.cube.draw(context, program_state, model_trans_wall2, this.materials.street);
    }

    get_place_block_transform(current_pos) {
        let place_block_transform = Mat4.identity();
        let cut_size = 0;
        let size = 0;
        if(this.counter % 2 === 0){
            cut_size = current_pos - this.prev_z;
            this.next[2] = this.next[2] - Math.abs(cut_size);
            place_block_transform = place_block_transform.times(Mat4.translation(this.prev_x,this.next[1],current_pos)).times(Mat4.scale(this.next[0],this.scaling_factor,this.next[2]));
            let x_min = this.bounding_boxes[this.bounding_boxes.length - 1].minX;
            let x_max = this.bounding_boxes[this.bounding_boxes.length - 1].maxX;
            let z_min = this.bounding_boxes[this.bounding_boxes.length - 1].minZ;
            let z_max = this.bounding_boxes[this.bounding_boxes.length - 1].maxZ;
            console.log("Cut size is " + cut_size);
            if (cut_size > 0) {
                z_max = z_max - cut_size;
            }
            else {
                z_min = z_min - cut_size;
            }
            size = this.bounding_boxes.push(new Bounding_Box(x_min, x_max, z_min, z_max));
            console.log ("Adding bounding box with x_min " + x_min + ", x_max " + x_max + ", z_min " + z_min + ", z_max " + z_max);
        }
        else {
            cut_size = current_pos - this.prev_x;
            this.next[0] = this.next[0] - Math.abs(cut_size);
            place_block_transform = place_block_transform.times(Mat4.translation(current_pos,this.next[1],this.prev_z)).times(Mat4.scale(this.next[0],this.scaling_factor,this.next[2]));
            let x_min = this.bounding_boxes[this.bounding_boxes.length - 1].minX;
            let x_max = this.bounding_boxes[this.bounding_boxes.length - 1].maxX;
            let z_min = this.bounding_boxes[this.bounding_boxes.length - 1].minZ;
            let z_max = this.bounding_boxes[this.bounding_boxes.length - 1].maxZ;
            console.log("Cut size is " + cut_size);
            if (cut_size > 0) {
                x_max = x_max - cut_size;
            }
            else {
                x_min = x_min - cut_size;
            }
            size = this.bounding_boxes.push(new Bounding_Box(x_min, x_max, z_min, z_max));
            console.log ("Adding bounding box with x_min " + x_min + ", x_max " + x_max + ", z_min " + z_min + ", z_max " + z_max);
        }
        console.log("Bounding box length is now " + this.bounding_boxes.length, " though our push says it is " + size);
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

        this.cut_transforms = this.cut_transforms.filter((value) => value[1][3] > -6);
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
        let example_transform = Mat4.identity().times(Mat4.translation(-8,this.title_height-2,0)).times(Mat4.scale(1,1,1)).times(Mat4.rotation(-0.8,0,1,0)).times(Mat4.rotation(-0.5,1,0,0));
        this.shapes.text.draw(context, program_state, example_transform, this.materials.text);
        this.shapes.text.set_string("Press r to restart",context.context);
        let example_transform2 = Mat4.identity().times(Mat4.translation(-18,this.title_height-6, 0)).times(Mat4.scale(1,1,1)).times(Mat4.rotation(-0.8,0,1,0)).times(Mat4.rotation(-0.5,1,0,0));
        this.shapes.text.draw(context, program_state, example_transform2, this.materials.text);
    }
}

class Texture_W extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `   
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec2 scaled_tex_coord = vec2(f_tex_coord.x, f_tex_coord.y);
                vec4 tex_color = texture2D( texture, scaled_tex_coord);
                                
                float u = mod(scaled_tex_coord.x, 1.0);
                float v = mod(scaled_tex_coord.y, 1.0);
                //center = 0.5, upperbound = 0.5 + 0.7/2 = 0.85, lowerbound = 0.5 - 0.7/2 = 0.15
                //thinkness = 0.7-0.5 = 0.2
                if(!(u > 0.02 && u < 0.98 && v > 0.02 && v < 0.98)){
                    tex_color = vec4(1, 1, 1, 1.0);
                }
                
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

class Texture_B extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `   
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec2 scaled_tex_coord = vec2(f_tex_coord.x, f_tex_coord.y);
                vec4 tex_color = texture2D( texture, scaled_tex_coord);
                                
                float u = mod(scaled_tex_coord.x, 1.0);
                float v = mod(scaled_tex_coord.y, 1.0);
                //center = 0.5, upperbound = 0.5 + 0.7/2 = 0.85, lowerbound = 0.5 - 0.7/2 = 0.15
                //thinkness = 0.7-0.5 = 0.2
                if(!(u > 0.02 && u < 0.98 && v > 0.02 && v < 0.98)){
                    tex_color = vec4(0, 0, 0, 1.0);
                }
                
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}
