var CanvasContainer = (function () {
    function CanvasContainer(canvas) {
        var _this = this;
        this.y = 0;
        this.gameLoop = function (number) {
            requestAnimationFrame(_this.gameLoop);
            _this.context.clearRect(0, 0, 1280, 720);
            _this.context.fillStyle = "black";
            _this.context.fillRect(number / 100, _this.y, 10, 10);
        };
        this.context = canvas.getContext("2d");
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