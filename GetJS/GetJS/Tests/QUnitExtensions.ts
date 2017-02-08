{
    let assert = (QUnit.assert as any);
    assert.close = (number: number, expected: number, error?: number, message?: string) => {
        if (error === void 0 || error === null) {
            error = 0.00001;
        }

        var result = number == expected || (number < expected + error && number > expected - error);

        assert.push(result, number, expected, message);
    };
    assert.vectorEqual = (vector: Vector, expected: Vector, error?: number) => {
        let message = "Expected: " + expected.toString() + ", actual: " + vector.toString();
        assert.push(vector.equals(expected, error), vector.toString(), expected.toString(), message);
    };

}
interface Assert {
    close: (number: number, expected: number, error?: number) => void;
    vectorEqual: (vector: Vector, expected: Vector, error?: number) => void;
}