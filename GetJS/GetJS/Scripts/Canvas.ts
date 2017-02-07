interface DrawCallback {
    (context: CanvasRenderingContext2D): void;
}
interface AdvanceCallback {
    (timeDelta: number): void;
}


class CanvasObject {
    public static CreateBox(position: () => Vector, size: Vector, angle: () => number): CanvasObject {
        return new CanvasObject(context => {
            try {
                context.save();
                let pos = position();
                context.translate(pos.x, pos.y)
                context.rotate(angle());
                context.fillStyle = "white";
                context.fillRect(-size.x / 2, -size.y / 2, size.x, size.y);
            } finally {
                context.restore();
            }
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

        //this.context.fillStyle = "black";
        //this.context.fillRect(0, 0, 1280, 720);
    }
    lastTime: number = 0;
    gameLoop = (time: number) => {
        requestAnimationFrame(this.gameLoop);

        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, 1280, 720);


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