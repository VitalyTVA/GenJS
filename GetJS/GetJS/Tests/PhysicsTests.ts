QUnit.test("CreateBox", assert => {
    let boxSize = new Vector(9, 13);
    let boxBody = Body.createBox(boxSize, 100, new Vector(200, 200), new Vector(80, -40), 2, 13);
    assert.equal(boxBody.mass, 100);
    assert.deepEqual(boxBody.position, new Vector(200, 200));
    assert.deepEqual(boxBody.velocity, new Vector(80, -40));
    assert.close(boxBody.momenOfInertia, 2083.333333);
    assert.equal(boxBody.angle, 2);
    assert.equal(boxBody.angularVelocity, 13);
});

QUnit.test("NoForceMotion", assert => {
    let body1 = Body.createBox(new Vector(10, 10), 100, new Vector(200, 100), new Vector(10, 20), 2, 3);
    let body2 = Body.createBox(new Vector(20, 20), 50, new Vector(100, 50), new Vector(50, 100), -4, -5);
    let physics = new Physics([body1, body2], []);

    assert.deepEqual(
        physics.positions(),
        [new Vector(200, 100), new Vector(100, 50)]
    );
    assert.deepEqual(
        physics.velocities(),
        [new Vector(10, 20), new Vector(50, 100)]
    );
    assert.deepEqual(physics.angles(), [2, -4]);
    assert.deepEqual(physics.angularVelocities(), [3, -5]);

    physics.advance(0.2);
    assert.deepEqual(
        physics.positions(),
        [new Vector(202, 104), new Vector(110, 70)]
    );
    assert.deepEqual(
        physics.velocities(),
        [new Vector(10, 20), new Vector(50, 100)]
    );
    assert.deepEqual(physics.angles(), [2.6, -5]);
    assert.deepEqual(physics.angularVelocities(), [3, -5]);
});

QUnit.test("NormalizeAngles", assert => {
    let body1 = Body.createBox(new Vector(10, 10), 100, new Vector(200, 100), new Vector(10, 20), 2, 3);
    let body2 = Body.createBox(new Vector(20, 20), 50, new Vector(100, 50), new Vector(50, 100), -4, -5);
    let physics = new Physics([body1, body2], []);

    physics.advance(2.2);
    assert.deepEqual(physics.angles(), [2.316814692820415, -2.4336293856408275]);
    assert.deepEqual(physics.angularVelocities(), [3, -5]);
});

QUnit.test("ForceFieldMotion", assert => {
    let physics = new Physics(
        [
            Body.createBox(new Vector(10, 10), 100, new Vector(200, 100), new Vector(10, 20)),
            Body.createBox(new Vector(20, 20), 50, new Vector(100, 50), new Vector(50, 100)),
        ],
        [
            Physics.createForceField(new Vector(2, 3)),
            { getForce: (body => null) },
            Physics.createForceField(new Vector(-4, 2)),
        ]
    );

    assert.deepEqual(
        physics.positions(),
        [new Vector(200, 100), new Vector(100, 50)]
    );
    assert.deepEqual(
        physics.velocities(),
        [new Vector(10, 20), new Vector(50, 100)]
    );

    physics.advance(0.2);
    assert.deepEqual(
        physics.positions(),
        [new Vector(201.92, 104.2), new Vector(109.92, 70.2)]
    );
    assert.deepEqual(
        physics.velocities(),
        [new Vector(9.6, 21), new Vector(49.6, 101)]
    );
    assert.deepEqual(
        physics.angles(),
        [0, 0]
    );
    assert.deepEqual(
        physics.angularVelocities(),
        [0, 0]
    );
});

QUnit.test("ForceFieldEnergy", assert => {
    const field = Physics.createForceField(new Vector(0, 3));
    assert.equal(60000, field.energy(Body.createBox(new Vector(10, 10), 100, new Vector(200, 200), new Vector(10, 20))));
    assert.equal(10500, field.energy(Body.createBox(new Vector(20, 20), 50, new Vector(100, 70), new Vector(50, 100))));
});

QUnit.test("InvalidAdvanceTimeValue", assert => {
    let physics = new Physics([],[]);

    assert.throws(() => physics.advance(0), "timeDelta should be positive");
    assert.throws(() => physics.advance(-0.1), "timeDelta should be positive");
});

QUnit.test("AppliedForceToDragAndTorque", assert => {
    assert.vectorEqual(
        new AppliedForce(new Vector(2, 3), new Vector(5, 5)).drag(new Vector(3, 2)),
        new Vector(2, 3)
    );
    assert.vectorEqual(
        new AppliedForce(new Vector(3, 4), new Vector(0, 6)).drag(new Vector(3, 2)),
        new Vector(-.84, 1.12)
    );
    assert.vectorEqual(
        new AppliedForce(new Vector(2, 3), new Vector(3, 2)).drag(new Vector(3, 2)),
        new Vector(2, 3)
    );
});

QUnit.test("DragAndTorqueMotion", assert => {
    let body = Body.createBox(new Vector(10, 10), 2, new Vector(200, 100), new Vector(0, 0));
    let physics = new Physics(
        [body],
        [
            { getForce: body => new AppliedForce(new Vector(1, 2), body.position.add(new Vector(2, 3))) },
            { getForce: body => new AppliedForce(new Vector(-1, 1), body.position.add(new Vector(2, 2))) },
        ]
    );

    physics.advance(0.2);
    assert.vectorEqual(body.position, new Vector(200.0246153, 100.036923));
    assert.vectorEqual(body.velocity, new Vector(0.1230769, 0.184615));
    assert.equal(body.angle, 0.006);
    assert.equal(body.angularVelocity, 0.03);
});

QUnit.test("FixedPointSpring", assert => {
    let body = Body.createBox(new Vector(10, 10), 2, new Vector(21, 13), new Vector(10, 20));
    let spring = Physics.createFixedSpring(15, new Vector(9, 13), body, new Vector(2, 3));

    let someBody = Body.createBox(new Vector(10, 10), 2, new Vector(200, 100), new Vector(0, 0));
    assert.equal(null, spring.getForce(someBody));
    assert.equal(0, spring.energy(someBody));

    let appliedForce = spring.getForce(body);
    assert.vectorEqual(appliedForce.force, new Vector(-210, -45));
    assert.vectorEqual(appliedForce.point, new Vector(23, 16));
    assert.equal(1537.5, spring.energy(body));

    body.angle = 2.2;
    appliedForce = spring.getForce(body);
    assert.vectorEqual(appliedForce.force, new Vector(-125.9626283, 2.227658));
    assert.vectorEqual(appliedForce.point, new Vector(17.39750855, 12.851489455));
    assert.equal(529.0515397254967, spring.energy(body));
});

QUnit.test("DynamicSpring", assert => {
    let body1 = Body.createBox(new Vector(10, 10), 2, new Vector(21, 13), new Vector(10, 20));
    let body2 = Body.createBox(new Vector(15, 25), 3, new Vector(57, 25), new Vector(30, 40));
    let spring = Physics.createDynamicSpring(15, body1, new Vector(9, 13), body2, new Vector(2, 3));

    assert.equal(null, spring.getForce(Body.createBox(new Vector(10, 10), 2, new Vector(200, 100), new Vector(0, 0))));

    let appliedForceBody1 = spring.getForce(body1);
    assert.vectorEqual(appliedForceBody1.force, new Vector(435, 30));
    assert.vectorEqual(appliedForceBody1.point, new Vector(30, 26));
    let appliedForceBody2 = spring.getForce(body2);
    assert.vectorEqual(appliedForceBody2.force, new Vector(-435, -30));
    assert.vectorEqual(appliedForceBody2.point, new Vector(59, 28));


    body1.angle = 2.2;
    body2.angle = -3.5;
    appliedForceBody1 = spring.getForce(body1);
    assert.vectorEqual(appliedForceBody1.force, new Vector(733.2255037095349, 153.99364925175052));
    assert.vectorEqual(appliedForceBody1.point, new Vector(5.193036695047217, 12.625953110056816));
    appliedForceBody2 = spring.getForce(body2);
    assert.vectorEqual(appliedForceBody2.force, new Vector(-733.2255037095349, -153.99364925175052));
    assert.vectorEqual(appliedForceBody2.point, new Vector(54.074736942349546, 22.89219639350685));
});