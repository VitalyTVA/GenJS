class Vector {
    public readonly x: number;
    public readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
class Size {
    public readonly width: number;
    public readonly height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}
class Body {
    public readonly mass: number;
    public position: Vector;
    public velocity: Vector;

    public readonly momenOfInertia: number;
    public angle: number;
    public angularVelocity: number;

    public static CreateBox(size: Size, mass: number, position: Vector, velocity: Vector, angle: number = 0, angularVelocity: number = 0): Body {
        let momentOfInertia = mass * (size.width * size.width + size.height * size.height) / 12;
        return new Body(mass, position, velocity, momentOfInertia, angle, angularVelocity);
    }

    private constructor(mass: number, position: Vector, velocity: Vector, momenOfInertia: number, angle: number, angularVelocity: number) {
        this.mass = mass;
        this.position = position;
        this.velocity = velocity;
        this.momenOfInertia = momenOfInertia;
        this.angle = angle;
        this.angularVelocity = angularVelocity;
    }
}

interface GetForceCallback {
    (body: Body): Vector;
}


class Physics {
    public readonly bodies: Array<Body>;
    public readonly forces: Array<GetForceCallback>;
    constructor(bodies: Array<Body>, forces: Array<GetForceCallback>) {
        this.bodies = bodies;
        this.forces = forces;
    }
    public next = (timeDelta: number) => {
        for (let body of this.bodies) {
            let totalForceX = 0;
            let totalForceY = 0;
            for (let force of this.forces) {
                let forceValue = force(body);
                totalForceX += forceValue.x;
                totalForceY += forceValue.y;
            }
            var v = body.velocity;
            body.velocity = new Vector(v.x + totalForceX / body.mass, v.y + totalForceY / body.mass);
        }

        for (var body of this.bodies) {
            var p = body.position;
            var v = body.velocity;
            body.position = new Vector(p.x + v.x * timeDelta, p.y + v.y * timeDelta);
        }
    }
}