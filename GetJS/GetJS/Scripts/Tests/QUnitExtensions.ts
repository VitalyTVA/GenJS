{
    let assert2 = (QUnit.assert as any);
    assert2.close = (number: number, expected: number, error?: number) => {
        if (error === void 0 || error === null) {
            error = 0.00001;
        }

        var result = number == expected || (number < expected + error && number > expected - error);

        assert2.push(result, number, expected, "");
    };
}
interface Assert {
    close: (number: number, expected: number, error?: number) => void;
}