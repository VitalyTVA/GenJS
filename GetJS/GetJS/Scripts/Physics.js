var Vector = (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    return Vector;
}());
var Body = (function () {
    function Body(mass, position, velocity, momenOfInertia, angle, angularVelocity) {
        this.mass = mass;
        this.position = position;
        this.velocity = velocity;
        this.momenOfInertia = momenOfInertia;
        this.angle = angle;
        this.angularVelocity = angularVelocity;
    }
    Body.CreateBox = function (size, mass, position, velocity, angle, angularVelocity) {
        if (angle === void 0) { angle = 0; }
        if (angularVelocity === void 0) { angularVelocity = 0; }
        var momentOfInertia = mass * (size.x * size.x + size.y * size.y) / 12;
        return new Body(mass, position, velocity, momentOfInertia, angle, angularVelocity);
    };
    return Body;
}());
var Physics = (function () {
    function Physics(bodies, forces) {
        var _this = this;
        this.positions = function () { return _this.bodies.map(function (x) { return x.position; }); };
        this.velocities = function () { return _this.bodies.map(function (x, _) { return x.velocity; }); };
        this.angles = function () { return _this.bodies.map(function (x, _) { return x.angle; }); };
        this.angularVelocities = function () { return _this.bodies.map(function (x, _) { return x.angularVelocity; }); };
        this.advance = function (timeDelta) {
            if (timeDelta <= 0)
                throw "timeDelta should be positive";
            for (var _i = 0, _a = _this.bodies; _i < _a.length; _i++) {
                var body_1 = _a[_i];
                var totalForceX = 0;
                var totalForceY = 0;
                for (var _b = 0, _c = _this.forces; _b < _c.length; _b++) {
                    var force = _c[_b];
                    var forceValue = force(body_1);
                    totalForceX += forceValue.x;
                    totalForceY += forceValue.y;
                }
                var v = body_1.velocity;
                body_1.velocity = new Vector(v.x + totalForceX / body_1.mass, v.y + totalForceY / body_1.mass);
            }
            for (var _d = 0, _e = _this.bodies; _d < _e.length; _d++) {
                var body = _e[_d];
                var p = body.position;
                var v = body.velocity;
                body.position = new Vector(p.x + v.x * timeDelta, p.y + v.y * timeDelta);
                body.angle = body.angle + body.angularVelocity * timeDelta;
                if (Math.abs(body.angle) > Math.PI * 2)
                    body.angle = body.angle % (Math.PI * 2);
            }
        };
        this.bodies = bodies;
        this.forces = forces;
    }
    Physics.CreateForceField = function (acceleration) { return function (body) {
        var mass = body.mass;
        return new Vector(acceleration.x * mass, acceleration.y * mass);
    }; };
    return Physics;
}());
//# sourceMappingURL=Physics.js.map