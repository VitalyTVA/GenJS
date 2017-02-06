

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

window.onload = () => {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();


    let boxSize = new Size(9, 13);
    let boxBody = Body.CreateBox(boxSize, 100, new Vector(200, 200), new Vector(80, -40));
    let canvasBox = CanvasObject.CreateBox(() => boxBody.position, boxSize);
    let gravity = (body: Body) => new Vector(0, 1 * body.mass);
    let physics = new Physics([boxBody], [gravity]);
    var canvas = new CanvasContainer(<HTMLCanvasElement>document.getElementById('canvas'), [canvasBox], physics.next);

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