{
    var assert2_1 = QUnit.assert;
    assert2_1.close = function (number, expected, error) {
        if (error === void 0 || error === null) {
            error = 0.00001;
        }
        var result = number == expected || (number < expected + error && number > expected - error);
        assert2_1.push(result, number, expected, "");
    };
}
//# sourceMappingURL=QUnitExtensions.js.map