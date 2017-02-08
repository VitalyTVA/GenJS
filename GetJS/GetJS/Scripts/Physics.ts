var EPSILON = 0.000001;

class Vector {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    vectorTo(point: Vector): Vector {
        return new Vector(point.x - this.x, point.y - this.y);
    }
    scalarProduct(v: Vector): number {
        return v.x * this.x + v.y  * this.y;
    }
    lengthSquare(): number {
        return this.x * this.x + this.y * this.y;
    }
    length(): number {
        return Math.sqrt(this.lengthSquare());
    }
    normalize(): Vector {
        let len = this.length();
        return new Vector(this.x / len, this.y / len);
    }
    mult(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y  * scalar);
    }
    subtract(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y  + v.y);
    }
    toString(): string {
        return "(" + this.x + ", " + this.y + ")";
    }
    equals(vector: Vector, threshold = EPSILON): boolean {
        if (Math.abs(this.x - vector.x) > threshold)
            return false;

        if (Math.abs(this.y - vector.y) > threshold)
            return false;

        return true;
    }
}
class AppliedForce {
    public readonly force: Vector;
    public readonly point: Vector;

    constructor(force: Vector, point: Vector) {
        this.force = force;
        this.point = point;
    }
    public drag(position: Vector): Vector{
        if (position.equals(this.point))
            return this.force;
        let centerVector = position.vectorTo(this.point);
        let centerVectorSquareLength = centerVector.lengthSquare();

        let dragLength = centerVector.scalarProduct(this.force) / Math.sqrt(centerVectorSquareLength);
        //let torqueLength = Math.sqrt(this.force.lengthSquare() - dragLength * dragLength); 

        let drag = centerVector.normalize().mult(dragLength);
        return drag;
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
    (body: Body): AppliedForce;
}


class Physics {
    public static readonly CreateForceField = (acceleration: Vector) => (body: Body) => {
        let mass = body.mass;
        return new AppliedForce(new Vector(acceleration.x * mass, acceleration.y * mass), body.position);
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
            let totalTorque = 0;
            for (let force of this.forces) {
                let forceValue = force(body);

                let drag = forceValue.drag(body.position);
                //let drag = forceValue.force;

                let r = body.position.vectorTo(forceValue.point);
                let torque = r.x * forceValue.force.y - r.y * forceValue.force.x;
                totalForceX += drag.x;
                totalForceY += drag.y;
                totalTorque += torque;
            }
            var v = body.velocity;
            body.velocity = new Vector(v.x + timeDelta * totalForceX / body.mass, v.y + timeDelta * totalForceY / body.mass);
            body.angularVelocity = body.angularVelocity + timeDelta * totalTorque / body.momenOfInertia;
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