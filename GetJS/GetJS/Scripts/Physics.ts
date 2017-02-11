var EPSILON = 0.000001;

class Vector {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    distance(b: Vector) {
        return this.subtract(b).length;
    }
    vectorTo(point: Vector): Vector {
        return new Vector(point.x - this.x, point.y - this.y);
    }
    scalarProduct(v: Vector): number {
        return v.x * this.x + v.y  * this.y;
    }
    get squareLength(): number {
        return this.x * this.x + this.y * this.y;
    }
    get length(): number {
        return Math.sqrt(this.squareLength);
    }
    normalize(): Vector {
        let len = this.length;
        return new Vector(this.x / len, this.y / len);
    }
    negate(): Vector {
        return new Vector(-this.x, -this.y);
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
    rotate(angle: number): Vector {
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        return new Vector(this.x * c - this.y * s, this.x * s + this.y * c);
    }
    setLength(length: number): Vector {
        return this.normalize().mult(length);
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
        let centerVectorSquareLength = centerVector.squareLength;

        let dragLength = centerVector.scalarProduct(this.force) / Math.sqrt(centerVectorSquareLength);

        let drag = centerVector.setLength(dragLength);
        return drag;
    }
}

class Body {
    readonly mass: number;
    position: Vector;
    velocity: Vector;

    readonly momenOfInertia: number;
    angle: number;
    angularVelocity: number;

    static createBox(size: Vector, mass: number, position: Vector, velocity: Vector, angle: number = 0, angularVelocity: number = 0): Body {
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
    toWorldPoint(bodyPoint: Vector) {
        const rotatedBodyPoint = bodyPoint.rotate(this.angle);
        return this.position.add(rotatedBodyPoint);
    }
}

interface ForceProvider {
    (body: Body): AppliedForce;
}
interface Spring extends ForceProvider {
    //TODO test methods
    from: () => Vector; //TODO how to make it readonly
    to: () => Vector;
}

class Physics {
    static createForceField(acceleration: Vector) {
        return (body: Body) => {
            let mass = body.mass;
            return new AppliedForce(
                new Vector(acceleration.x * mass, acceleration.y * mass), body.position);
        };
    }
    static createFixedSpring(rate: number, fixedPoint: Vector, body: Body, bodyPoint: Vector) {
        let actualBodyPoint = () => body.toWorldPoint(bodyPoint);
        let spring = <Spring>function (x: Body) {
            if (body !== x)
                return null;
            let to = actualBodyPoint();

            let vectorToFixedPoint = fixedPoint.subtract(to);
            let force = vectorToFixedPoint.mult(rate);
            return new AppliedForce(force, to);
        }
        spring.from = () => fixedPoint;
        spring.to = actualBodyPoint;
        return spring;
    }
    static createDynamicSpring(rate: number, fromBody: Body, fromBodyPoint: Vector, toBody: Body, toBodyPoint: Vector) {
        let fromBodyWorldPoint = () => fromBody.toWorldPoint(fromBodyPoint);
        let toBodyWorldPoint = () => toBody.toWorldPoint(toBodyPoint);
        let spring = <Spring>function (x: Body) {
            if (fromBody !== x && toBody !== x)
                return null;
            let from = fromBodyWorldPoint();
            let to = toBodyWorldPoint();

            let vectorBetween = to.subtract(from);
            let force = vectorBetween.mult(rate);
            if (toBody === x) {
                force = force.negate();
                from = to;
            }
            //TODO duplicated code
            return new AppliedForce(force, from);
        }
        spring.from = fromBodyWorldPoint;
        spring.to = toBodyWorldPoint;
        return spring;
    }


    public readonly bodies: Array<Body>;
    public readonly forces: Array<ForceProvider>;
    constructor(bodies: Array<Body>, forces: Array<ForceProvider>) {
        this.bodies = bodies;
        this.forces = forces;
    }
    public readonly positions = () => this.bodies.map(x => x.position);
    public readonly velocities = () => this.bodies.map((x, _) => x.velocity);
    public readonly angles = () => this.bodies.map((x, _) => x.angle);
    public readonly angularVelocities = () => this.bodies.map((x, _) => x.angularVelocity);

    advance (timeDelta: number) {
        const steps = 1;
        for (let i = 0; i < steps; i++) {
            this.advanceCore(timeDelta / steps);
        }
    }
    private advanceCore (timeDelta: number) {
        if (timeDelta <= 0)
            throw "timeDelta should be positive";
        for (let body of this.bodies) {
            let totalForceX = 0;
            let totalForceY = 0;
            let totalTorque = 0;
            for (let force of this.forces) {
                let forceValue = force(body);
                if (forceValue == null)
                    continue;

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