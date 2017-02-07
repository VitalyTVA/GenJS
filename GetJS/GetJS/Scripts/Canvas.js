var CanvasObject = (function () {
    function CanvasObject(draw) {
        this.draw = draw;
    }
    CanvasObject.CreateBox = function (position, size, angle) {
        return new CanvasObject(function (context) {
            try {
                context.save();
                var pos = position();
                context.translate(pos.x, pos.y);
                context.rotate(angle());
                context.fillStyle = "white";
                context.fillRect(-size.x / 2, -size.y / 2, size.x, size.y);
            }
            finally {
                context.restore();
            }
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
            _this.context.fillStyle = "black";
            _this.context.fillRect(0, 0, 1280, 720);
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
        //this.context.fillStyle = "black";
        //this.context.fillRect(0, 0, 1280, 720);
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