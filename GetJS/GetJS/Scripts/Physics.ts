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
    readonly acceleration: Vector;
}
interface SpringForceProvider extends ForceProvider {
    //TODO test methods
    from(): Vector;
    to(): Vector;
}
interface ConstraintForce {
    getConstraintForce(body: Body, realBodyPosition: Vector, externalForce: Vector): Vector;
    getCorrectionForce(realBodyPosition: Vector): Vector;
}
interface FixedLengthConstraintForce extends ConstraintForce {
    readonly origin: Vector;
    readonly length: number;
}

interface PhysicsSetup {
    readonly boxes: BoxBody[];
    readonly forceFields: ForceProvider[];
    readonly constraints?: FixedLengthConstraintForce[];
    readonly springs: SpringForceProvider[];
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
        let actualBodyPoint = () => BodyTraits.toWorldPoint(body, bodyPoint);
        return {
            getForce: x => {
                if (body !== x)
                    return null;
                let to = actualBodyPoint();

                let vectorToFixedPoint = fixedPoint.subtract(to);
                let force = vectorToFixedPoint.mult(rate);
                return new AppliedForce(force, to);
            },
            energy: x => {
                if (body !== x)
                    return 0;
                return actualBodyPoint().subtract(fixedPoint).squareLength * rate / 2;
            },
            from: () => fixedPoint,
            to: actualBodyPoint,
        };
    }
    static createDynamicSpring(rate: number, fromBody: Body, fromBodyPoint: Vector, toBody: Body, toBodyPoint: Vector): SpringForceProvider {
        let fromBodyWorldPoint = () => BodyTraits.toWorldPoint(fromBody, fromBodyPoint);
        let toBodyWorldPoint = () => BodyTraits.toWorldPoint(toBody, toBodyPoint);
        return {
            getForce: x => {
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
            },
            energy: x => {
                //TODO test
                if (fromBody !== x)
                    return 0;
                return fromBodyWorldPoint().subtract(toBodyWorldPoint()).squareLength * rate / 2;
            },
            from: fromBodyWorldPoint,
            to: toBodyWorldPoint,
        }
    }


    readonly bodies: Array<Body>;
    readonly forces: Array<ForceProvider>;
    readonly step: number;
    readonly advanceMode: AdvanceMode;
    readonly constraints: Array<ConstraintForce>;
    readonly realPositions: Vector[];
    stopped: boolean;
    constructor(bodies: Array<Body>, forces: Array<ForceProvider>, constraints: Array<ConstraintForce>, step: number = Physics.defaultStep, advanceMode: AdvanceMode = AdvanceMode.Default) {
        if (step <= 0)
            throw "timeDelta should be positive";

        this.bodies = bodies;
        this.forces = forces;
        this.step = step;
        this.advanceMode = advanceMode;
        this.constraints = constraints;

        this.realPositions = bodies.map(x => x.position);

        if (this.advanceMode == AdvanceMode.Smart)
            this.advanceVelocities(step / 2);
    }
    static create(setup: PhysicsSetup) {
        //TODO always create via PhysicsSetup??
        let constraints = setup.constraints;
        if (constraints == undefined)
            constraints = [];
        return new Physics(setup.boxes, setup.forceFields.concat(setup.springs), constraints, Physics.defaultStep, AdvanceMode.Default);
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
        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i];
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
            if (this.constraints.length > 1)
                throw "TODO";
            if (this.constraints.length == 1) {
                let constraintForce = this.constraints[0].getConstraintForce(body, this.realPositions[i], new Vector(totalForceX, totalForceY));
                let correctionForce = this.constraints[0].getCorrectionForce(this.realPositions[i]);
                totalForceX += constraintForce.x + correctionForce.x;
                totalForceY += constraintForce.y + correctionForce.y;
            }

            var v = body.velocity;
            body.velocity = new Vector(v.x + dt * totalForceX / body.mass, v.y + dt * totalForceY / body.mass);
            body.angularVelocity = body.angularVelocity + dt * totalTorque / body.momenOfInertia;
        }
    }
    private advancePositions(dt: number) {
        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i];
            var p = body.position;
            var v = body.velocity;
            body.position = new Vector(p.x + v.x * dt, p.y + v.y * dt);

            //TODO angle, etc
            if (this.advanceMode == AdvanceMode.Default)
                this.realPositions[i] = body.position;
            else
                this.realPositions[i] = new Vector(p.x + v.x * dt / 2, p.y + v.y * dt / 2);

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