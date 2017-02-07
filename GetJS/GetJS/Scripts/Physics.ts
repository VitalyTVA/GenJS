class Vector {
    public readonly x: number;
    public readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
class Body {
    public readonly mass: number;
    public position: Vector;
    public velocity: Vector;

    public readonly momenOfInertia: number;
    public angle: number;
    public angularVelocity: number;

    public static CreateBox(size: Vector, mass: number, position: Vector, velocity: Vector, angle: number = 0, angularVelocity: number = 0): Body {
        let momentOfInertia = mass * (size.x * size.x + size.y * size.y) / 12;
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
    public static readonly CreateForceField = (acceleration: Vector) => (body: Body) => {
        let mass = body.mass;
        return new Vector(acceleration.x * mass, acceleration.y * mass);
    }

    public readonly bodies: Array<Body>;
    public readonly forces: Array<GetForceCallback>;
    constructor(bodies: Array<Body>, forces: Array<GetForceCallback>) {
        this.bodies = bodies;
        this.forces = forces;
    }
    public readonly positions = () => this.bodies.map(x => x.position);
    public readonly velocities = () => this.bodies.map((x, _) => x.velocity);
    public readonly angles = () => this.bodies.map((x, _) => x.angle);
    public readonly angularVelocities = () => this.bodies.map((x, _) => x.angularVelocity);
    
    public advance = (timeDelta: number) => {
        if (timeDelta <= 0)
            throw "timeDelta should be positive";
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
            body.angle = body.angle + body.angularVelocity * timeDelta;
            if (Math.abs(body.angle) > Math.PI * 2)
                body.angle = body.angle % (Math.PI * 2);
        }
    }
}