var CanvasObject = (function () {
    function CanvasObject(draw) {
        this.draw = draw;
    }
    CanvasObject.CreateBox = function (position, size) {
        return new CanvasObject(function (context) {
            var pos = position();
            context.fillStyle = "black";
            context.fillRect(pos.x - size.width / 2, pos.y - size.height / 2, size.width, size.height);
        });
    };
    return CanvasObject;
}());
var CanvasContainer = (function () {
    function CanvasContainer(canvas, objects, advance) {
        var _this = this;
        this.y = 0;
        this.lastTime = 0;
        this.gameLoop = function (time) {
            requestAnimationFrame(_this.gameLoop);
            _this.context.clearRect(0, 0, 1280, 720);
            _this.context.fillStyle = "black";
            _this.context.fillRect(time / 100, _this.y, 10, 10);
            _this.advance((time - _this.lastTime) / 1000);
            for (var _i = 0, _a = _this.objects; _i < _a.length; _i++) {
                var obj = _a[_i];
                obj.draw(_this.context);
            }
            _this.lastTime = time;
        };
        this.context = canvas.getContext("2d");
        this.objects = objects;
        this.advance = advance;
        requestAnimationFrame(this.gameLoop);
    }
    CanvasContainer.prototype.up = function () {
        this.y--;
    };
    CanvasContainer.prototype.down = function () {
        this.y++;
    };
    return CanvasContainer;
}());
//# sourceMappingURL=Canvas.js.map