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
    readonly force: Vector;
    readonly point: Vector;

    constructor(force: Vector, point: Vector) {
        this.force = force;
        this.point = point;
    }
}

interface Body {
    readonly mass: number;
    position: Vector;
    velocity: Vector;

    readonly momenOfInertia: number;
    angle: number;
    angularVelocity: number;
}
interface BoxBody extends Body {
    readonly size: Vector;
}


function createBox(size: Vector, mass: number, position: Vector, velocity: Vector, angle: number = 0, angularVelocity: number = 0): BoxBody {
    let momentOfInertia = mass * (size.x * size.x + size.y * size.y) / 12;
    return {
        mass: mass,
        position: position,
        velocity: velocity,
        momenOfInertia: momentOfInertia,
        angle: angle,
        angularVelocity: angularVelocity,
        size: size,
    };
}


class BodyTraits {
    static toWorldPoint(body: Body, bodyPoint: Vector) {
        const rotatedBodyPoint = bodyPoint.rotate(body.angle);
        return body.position.add(rotatedBodyPoint);
    }
    static energy(body: Body) {
        return (body.velocity.squareLength * body.mass + body.angularVelocity * body.angularVelocity * body.momenOfInertia) / 2
    }
}

interface ForceProvider {
    getForce(body: Body): AppliedForce;
    energy?(body: Body): number;
}
interface ForceField extends ForceProvider {
    acceleration: Vector;
}
interface SpringForceProvider extends ForceProvider {
    //TODO test methods
    from(): Vector;
    to(): Vector;
}

interface PhysicsSetup {
    boxes: BoxBody[];
    forceFields: ForceProvider[];
    springs: SpringForceProvider[];
}
enum AdvanceMode {
    Default,
    Smart,
}
class Physics {
    static readonly defaultStep = 0.01;
    static createForceField(acceleration: Vector): ForceField {
        return {
            getForce: body => {
                let mass = body.mass;
                return new AppliedForce(
                    new Vector(acceleration.x * mass, acceleration.y * mass), body.position);
            },
            energy: body => {
                if (acceleration.x != 0)
                    throw "todo";
                return -acceleration.y * body.mass * body.position.y; 
            },
            acceleration: acceleration,
        };
    }
    static createGravity(g: number): ForceField {
        return Physics.createForceField(new Vector(0, g));
    } 
    static createFixedSpring(rate: number, fixedPoint: Vector, body: Body, bodyPoint: Vector): SpringForceProvider {
        let spring = Physics.createSpring(
            rate,
            () => fixedPoint,
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
        };
    }
    static createDynamicSpring(rate: number, fromBody: Body, fromBodyPoint: Vector, toBody: Body, toBodyPoint: Vector): SpringForceProvider {
        let spring = Physics.createSpring(
            rate,
            () => BodyTraits.toWorldPoint(fromBody, fromBodyPoint),
            () => BodyTraits.toWorldPoint(toBody, toBodyPoint));
        return {
            getForce: x => {
                if (fromBody !== x && toBody !== x)
                    return null;   
                if (toBody === x) {
                    return spring.getToForce();
                }
                return spring.getFromForce();
            },
            energy: x => {
                //TODO test
                if (fromBody !== x)
                    return 0;
                return spring.energy();
            },
            from: spring.from,
            to: spring.to,
        }
    }

    static createSpring(rate: number, fromWorldPoint: () => Vector, toWorldPoint: () => Vector) {
        let getForce = (from: Vector, to: Vector) => {
            let vectorBetween = to.subtract(from);
            let force = vectorBetween.mult(rate);
            return new AppliedForce(force, from);
        };
        return {
            getFromForce: () => getForce(fromWorldPoint(), toWorldPoint()),
            getToForce: () => getForce(toWorldPoint(), fromWorldPoint()),
            energy: () => fromWorldPoint().subtract(toWorldPoint()).squareLength * rate / 2,
            from: fromWorldPoint,
            to: toWorldPoint, 
        }
    }


    readonly bodies: Array<Body>;
    readonly forces: Array<ForceProvider>;
    readonly step: number;
    readonly advanceMode: AdvanceMode;
    stopped: boolean;
    constructor(bodies: Array<Body>, forces: Array<ForceProvider>, step: number = Physics.defaultStep, advanceMode: AdvanceMode = AdvanceMode.Default) {
        if (step <= 0)
            throw "timeDelta should be positive";

        this.bodies = bodies;
        this.forces = forces;
        this.step = step;
        this.advanceMode = advanceMode;

        if (this.advanceMode == AdvanceMode.Smart)
            this.advanceVelocities(step / 2);
    }
    static create(setup: PhysicsSetup) {
        return new Physics(setup.boxes, setup.forceFields.concat(setup.springs), Physics.defaultStep, AdvanceMode.Smart);
    }

    readonly positions = () => this.bodies.map(x => x.position);
    readonly velocities = () => this.bodies.map((x, _) => x.velocity);
    readonly angles = () => this.bodies.map((x, _) => x.angle);
    readonly angularVelocities = () => this.bodies.map((x, _) => x.angularVelocity);

    advance() {
        if (this.stopped) {
            throw "Simulation stopped";
        }
        if (this.advanceMode == AdvanceMode.Default) {
            this.advanceVelocities(this.step);
            this.advancePositions(this.step);
        } else {
            this.advancePositions(this.step);
            this.advanceVelocities(this.step);
        }
    }
    catchUpPositions() {
        if (this.advanceMode == AdvanceMode.Smart) {
            this.advancePositions(this.step / 2);
            this.stopped = true;
        }
    }
    private advanceVelocities(dt: number) {
        for (let body of this.bodies) {
            let totalForceX = 0;
            let totalForceY = 0;
            let totalTorque = 0;
            for (let force of this.forces) {
                let forceValue = force.getForce(body);
                if (forceValue == null)
                    continue;

                let r = body.position.vectorTo(forceValue.point);
                let torque = r.x * forceValue.force.y - r.y * forceValue.force.x;

                totalForceX += forceValue.force.x;
                totalForceY += forceValue.force.y;
                totalTorque += torque;
            }
            var v = body.velocity;
            body.velocity = new Vector(v.x + dt * totalForceX / body.mass, v.y + dt * totalForceY / body.mass);
            body.angularVelocity = body.angularVelocity + dt * totalTorque / body.momenOfInertia;
        }
    }
    private advancePositions(dt: number) {
        for (var body of this.bodies) {
            var p = body.position;
            var v = body.velocity;
            body.position = new Vector(p.x + v.x * dt, p.y + v.y * dt);
            body.angle = body.angle + body.angularVelocity * dt;
            if (Math.abs(body.angle) > Math.PI * 2)
                body.angle = body.angle % (Math.PI * 2);
        }
    }
    totalEnergy() {
        let res = 0;
        this.bodies.forEach(x => {
            res += BodyTraits.energy(x);
            this.forces.forEach(f => res += f.energy(x));
        });
        return res;
    }
}