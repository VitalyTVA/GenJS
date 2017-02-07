QUnit.test("CreateBox", assert => {
    let boxSize = new Vector(9, 13);
    let boxBody = Body.CreateBox(boxSize, 100, new Vector(200, 200), new Vector(80, -40), 2, 13);
    assert.equal(boxBody.mass, 100);
    assert.deepEqual(boxBody.position, new Vector(200, 200));
    assert.deepEqual(boxBody.velocity, new Vector(80, -40));
    assert.close(boxBody.momenOfInertia, 2083.333333);
    assert.equal(boxBody.angle, 2);
    assert.equal(boxBody.angularVelocity, 13);
});

QUnit.test("NoForceMotion", assert => {
    let body1 = Body.CreateBox(new Vector(10, 10), 100, new Vector(200, 100), new Vector(10, 20), 2, 3);
    let body2 = Body.CreateBox(new Vector(20, 20), 50, new Vector(100, 50), new Vector(50, 100), -4, -5);
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
    let body1 = Body.CreateBox(new Vector(10, 10), 100, new Vector(200, 100), new Vector(10, 20), 2, 3);
    let body2 = Body.CreateBox(new Vector(20, 20), 50, new Vector(100, 50), new Vector(50, 100), -4, -5);
    let physics = new Physics([body1, body2], []);

    physics.advance(2.2);
    assert.deepEqual(physics.angles(), [2.316814692820415, -2.4336293856408275]);
    assert.deepEqual(physics.angularVelocities(), [3, -5]);
});

QUnit.test("ForceFieldMotion", assert => {
    let physics = new Physics(
        [
            Body.CreateBox(new Vector(10, 10), 100, new Vector(200, 100), new Vector(10, 20)),
            Body.CreateBox(new Vector(20, 20), 50, new Vector(100, 50), new Vector(50, 100)),
        ],
        [
            Physics.CreateForceField(new Vector(2, 3)),
            Physics.CreateForceField(new Vector(-4, 2)),
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
        [new Vector(201.6, 105), new Vector(109.6, 71)]
    );
    assert.deepEqual(
        physics.velocities(),
        [new Vector(8, 25), new Vector(48, 105)]
    );
});

QUnit.test("InvalidAdvanceTimeValue", assert => {
    let physics = new Physics(
        [Body.CreateBox(new Vector(10, 10), 100, new Vector(200, 100), new Vector(10, 20))],
        []
    );

    assert.throws(() => physics.advance(0), "timeDelta should be positive");
    assert.throws(() => physics.advance(-0.1), "timeDelta should be positive");
});