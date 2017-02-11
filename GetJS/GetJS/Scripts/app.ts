

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

class ModelFactory {
    static createBoxModel(size: Vector, mass: number, position: Vector, velocity: Vector, angle: number = 0, angularVelocity: number = 0) {
        let body = Body.createBox(size, mass, position, velocity, angle, angularVelocity);
        let view = View.createBox(() => body.position, size, () => body.angle);
        return new Model(body, view);
    }
    static createSpringModel(spring: Spring) {
        let view = View.createSpring(spring.from, spring.to);
        return new Model(spring, view);
    }
}
class Model<T> {
    readonly value: T;
    readonly view: View;
    constructor(value: T, view: View) {
        this.value = value;
        this.view = view;
    }
}


window.onload = () => {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();

    let model1 = ModelFactory.createBoxModel(new Vector(9, 13), 100, new Vector(200, 200), new Vector(80, -40), 1, 2);

    let boxSize2 = new Vector(100, 20);
    let model2 = ModelFactory.createBoxModel(boxSize2, 100, new Vector(100, 500), new Vector(0, 0));
    let springModel2 = ModelFactory.createSpringModel(Physics.createFixedSpring(250, new Vector(100, 100), model2.value, new Vector(boxSize2.x / 2, 0))); 

    let boxSize3 = new Vector(100, 20);
    let model3 = ModelFactory.createBoxModel(boxSize3, 100, new Vector(300, 300), new Vector(0, 0));
    let model3_ = ModelFactory.createBoxModel(boxSize3, 100, new Vector(300, 500), new Vector(0, 0));
    let springModel3 = ModelFactory.createSpringModel(
        Physics.createFixedSpring(500, new Vector(300, 100), model3.value, new Vector(boxSize3.x / 2, 0))
    ); 
    let springModel3_ = ModelFactory.createSpringModel(
        Physics.createDynamicSpring(500, model3.value, new Vector(-boxSize3.x / 2, 0), model3_.value, new Vector(boxSize3.x / 2, 0))
    ); 


    let gravity = Physics.createForceField(new Vector(0, 100));
    let physics = new Physics(
        [
            model1.value,
            model2.value,
            model3.value,
            model3_.value
        ], [
            gravity,
            springModel2.value,
            springModel3.value,
            springModel3_.value
        ]);
    var canvas = new CanvasContainer(<HTMLCanvasElement>document.getElementById('canvas'),
        [
            model1.view,
            model2.view,
            model3.view,
            model3_.view,
            springModel2.view,
            springModel3.view,
            springModel3_.view
        ], dt => physics.advance(dt));

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