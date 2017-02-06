interface DrawCallback {
    (context: CanvasRenderingContext2D): void;
}
interface AdvanceCallback {
    (timeDelta: number): void;
}


class CanvasObject {
    public static CreateBox(position: () => Vector, size: Size): CanvasObject {
        return new CanvasObject(context => {
                let pos = position();
                context.fillStyle = "black";
                context.fillRect(pos.x - size.width / 2, pos.y - size.height / 2, size.width, size.height);
        });
    }
    public readonly draw: DrawCallback;
    private constructor(draw: DrawCallback) {
        this.draw = draw;
    }
}

class CanvasContainer {
    context: CanvasRenderingContext2D;
    objects: CanvasObject[];
    y: number = 0;
    advance: AdvanceCallback;

    constructor(canvas: HTMLCanvasElement, objects: CanvasObject[], advance: AdvanceCallback) {
        this.context = canvas.getContext("2d");
        this.objects = objects;
        this.advance = advance;

        requestAnimationFrame(this.gameLoop);
    }
    lastTime: number = 0;
    gameLoop = (time: number) => {
        requestAnimationFrame(this.gameLoop);
        this.context.clearRect(0, 0, 1280, 720);
        this.context.fillStyle = "black";
        this.context.fillRect(time / 100, this.y, 10, 10);


        this.advance((time - this.lastTime) / 1000);
        for (var obj of this.objects) {
            obj.draw(this.context);
        }

        this.lastTime = time;
    };
    public up(): void {
        this.y--;
    }
    public down(): void {
        this.y++;
    }
}