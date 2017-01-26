class CanvasContainer {
    context: CanvasRenderingContext2D;
    y: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.context = canvas.getContext("2d");

        requestAnimationFrame(this.gameLoop);
    }
    gameLoop = (number: number) => {
        requestAnimationFrame(this.gameLoop);
        this.context.clearRect(0, 0, 1280, 720);
        this.context.fillStyle = "black";
        this.context.fillRect(number / 100, this.y, 10, 10);
    };
    public up(): void {
        this.y--;
    }
    public down(): void {
        this.y++;
    }
}