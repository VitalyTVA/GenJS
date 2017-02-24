function createSupprtSpring(rate: number, body: Body, bodyPoint: Vector): SpringForceProvider {
    let spring = Physics.createSpring(
        rate,
        () => new Vector(BodyTraits.toWorldPoint(body, bodyPoint).x, 0),
        () => BodyTraits.toWorldPoint(body, bodyPoint));
    return {
        getForce: x => {
            if (body !== x)
                return null;
            return spring.getToForce();
        },
        energy: x => {
            if (body !== x)
                return 0;
            return spring.energy();
        },
        from: spring.from,
        to: spring.to,
        setRate: spring.setRate,
    };
}


function subscribe(canvas: HTMLCanvasElement, offset: Vector, onMove: (delta: number) => void, onUp: () => void) {
    let startX: number;
    function getX(event: MouseEvent) {
        var x: number = event.x;
        x -= canvas.offsetTop + offset.x;
        return x;
    }
    function mouseDown(event: MouseEvent): void {
        startX = getX(event);
    }
    function mouseUp(event: MouseEvent): void {
        startX = undefined;
        onUp();
    }
    function mouseMove(event: MouseEvent): void {
        if (startX == undefined)
            return;
        let delta = (getX(event) - startX) * 2;
        onMove(delta);
    }
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.addEventListener("mouseleave", mouseUp, false);
}

window.onload = () => {
    createForceInversePendulum();
    createSpringInversePendulum();
};
function createForceInversePendulum() {
    let boxSize = new Vector(10, 300);
    let box = createBox(boxSize, 100, new Vector(0, -boxSize.y / 2), new Vector(0, 0), 0);
    let distance = 400;
    let rate = 200;
    let support = createSupprtSpring(1000, box, new Vector(0, boxSize.y / 2));
    let offset = new Vector(400, 400);

    let forceValue = 0;
    let force: ForceProvider = {
        getForce: (b: Body) => {
            return new AppliedForce(new Vector(forceValue, 0), new Vector(0, boxSize.y / 2));
        },
    };
    let lastY: number;
    let dampForce: ForceProvider = {
        getForce: (b: Body) => {
            let newY = BodyTraits.toWorldPoint(b, new Vector(0, boxSize.y / 2)).y;
            if (lastY == undefined) {
                lastY = newY;
                return null;
            }
            let f = (lastY - newY) * 10000;
            lastY = newY;
            return new AppliedForce(new Vector(0, f), new Vector(0, boxSize.y / 2));
        },
    };

    let canvas = <HTMLCanvasElement>document.getElementById('canvas');
    var simulation = createSimulation(
        canvas,
        [
            [
                {
                    boxes: [box],
                    forceFields: [Physics.createGravity(100)],
                    springs: [support],
                    additionalForces: [force, dampForce],
                },
                offset
            ],
        ],
        debug => { }
    );
    subscribe(canvas, offset,
        delta => {
            forceValue = delta * 40;
        },
        () => {
            forceValue = 0;

        }
    );
}
function createSpringInversePendulum() {
    let boxSize = new Vector(10, 300);
    let box = createBox(boxSize, 100, new Vector(0, -boxSize.y / 2), new Vector(0, 0), 0);
    let distance = 400;
    let rate = 200;
    let leftSpring = Physics.createFixedSpring(rate, new Vector(-distance, 0), box, new Vector(0, boxSize.y / 2));
    let rightSpring = Physics.createFixedSpring(rate, new Vector(distance, 0), box, new Vector(0, boxSize.y / 2));
    let support = createSupprtSpring(200, box, new Vector(0, boxSize.y / 2));
    let offset = new Vector(400, 400);

    let canvas = <HTMLCanvasElement>document.getElementById('canvas2');
    var simulation = createSimulation(
        canvas,
        [
            [
                {
                    boxes: [box],
                    forceFields: [Physics.createGravity(100)],
                    springs: [leftSpring, rightSpring, support],
                },
                offset
            ],
        ],
        debug => { }
    );
    subscribe(canvas, offset,
        delta => {
            if (delta > 0) {
                leftSpring.setRate(rate);
                rightSpring.setRate(rate + delta);
            } else {
                leftSpring.setRate(rate - delta);
                rightSpring.setRate(rate);
            }
        },
        () => {
            leftSpring.setRate(rate);
            rightSpring.setRate(rate);

        });
}
