

class Greeter {
    element: HTMLElement;
    span: HTMLElement;
    timerToken: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }

    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }

}

class Model {
    static createBox(size: Vector, mass: number, position: Vector, velocity: Vector, angle: number = 0, angularVelocity: number = 0): Model {
        let body = Body.createBox(size, mass, position, velocity, angle, angularVelocity);
        let view = View.createBox(() => body.position, size, () => body.angle);
        return new Model(body, view);
    }

    readonly body: Body;
    readonly view: View;
    constructor(body: Body, view: View) {
        this.body = body;
        this.view = view;
    }
}

window.onload = () => {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();


    //TODO createModels method

    let model1 = Model.createBox(new Vector(9, 13), 100, new Vector(200, 200), new Vector(80, -40), 1, 2);

    let boxSize2 = new Vector(100, 20);
    let model2 = Model.createBox(boxSize2, 100, new Vector(100, 500), new Vector(0, 0));

    let springFrom = new Vector(100, 100);
    let springTo = new Vector(boxSize2.x / 2, 0);
    let spring1 = Physics.CreateSpring(250, new Vector(100, 100), model2.body, springTo);
    //TODO body.toWorldPoint or better make force object with additional properties
    let canvasSpring1 = View.CreateSpring(() => springFrom, () => springTo.rotate(model2.body.angle).add(model2.body.position));

    let gravity = Physics.CreateForceField(new Vector(0, 100));
    let physics = new Physics([model1.body, model2.body], [gravity, spring1]);
    var canvas = new CanvasContainer(<HTMLCanvasElement>document.getElementById('canvas'), [model1.view, model2.view, canvasSpring1], physics.advance);

    //document.addEventListener('keydown', event => {
    //    if (event.keyCode == 37) {
    //        //window.alert("Left Key Pressed");
    //    }
    //    else if (event.keyCode == 38) {
    //        canvas.up();
    //    }
    //    else if (event.keyCode == 39) {
    //        //window.alert("Right Key Pressed");
    //    }
    //    else if (event.keyCode == 40) {
    //        canvas.down();
    //    }
    //    else if (event.keyCode == 32) {
    //        //window.alert("Space Key Pressed");
    //    }
    //});
};