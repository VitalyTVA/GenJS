

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

    var canvas = new CanvasContainer(<HTMLCanvasElement>document.getElementById('canvas'))

    document.addEventListener('keydown', event => {
        if (event.keyCode == 37) {
            //window.alert("Left Key Pressed");
        }
        else if (event.keyCode == 38) {
            canvas.up();
        }
        else if (event.keyCode == 39) {
            //window.alert("Right Key Pressed");
        }
        else if (event.keyCode == 40) {
            canvas.down();
        }
        else if (event.keyCode == 32) {
            //window.alert("Space Key Pressed");
        }
    });
    var gravity = new PhysicsType2d.Vector2(0.0, -9.78);
    var world = new PhysicsType2d.Dynamics.World(gravity);
};