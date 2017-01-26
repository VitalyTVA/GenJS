var Greeter = (function () {
    function Greeter(element) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }
    Greeter.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () { return _this.span.innerHTML = new Date().toUTCString(); }, 500);
    };
    Greeter.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Greeter;
}());
window.onload = function () {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();
    var canvas = new CanvasContainer(document.getElementById('canvas'));
    document.addEventListener('keydown', function (event) {
        if (event.keyCode == 37) {
        }
        else if (event.keyCode == 38) {
            canvas.up();
        }
        else if (event.keyCode == 39) {
        }
        else if (event.keyCode == 40) {
            canvas.down();
        }
        else if (event.keyCode == 32) {
        }
    });
};
//# sourceMappingURL=app.js.map