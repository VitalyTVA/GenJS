QUnit.test("CreateBoxTest", assert => {
    let boxSize = new Size(9, 13);
    let boxBody = Body.CreateBox(boxSize, 100, new Vector(200, 200), new Vector(80, -40), 2, 13);
    assert.equal(100, boxBody.mass);
    assert.deepEqual(new Vector(200, 200), boxBody.position);
    assert.deepEqual(new Vector(80, -40), boxBody.velocity);
    assert.close(2083.333333, boxBody.momenOfInertia);
    assert.equal(2, boxBody.angle);
    assert.equal(13, boxBody.angularVelocity);
});