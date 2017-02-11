interface DrawCallback {
    (context: CanvasRenderingContext2D): void;
}
interface AdvanceCallback {
    (timeDelta: number): void;
}


class View {
    public static createBox(position: () => Vector, size: Vector, angle: () => number): View {
        return new View(context => {
            let pos = position();
            context.translate(pos.x, pos.y)
            context.rotate(angle());
            context.fillStyle = "white";
            context.fillRect(-size.x / 2, -size.y / 2, size.x, size.y);
        });
    }
    public static createSpring(from: () => Vector, to: () => Vector): View {
        return new View(context => {
            context.strokeStyle = "green";
            context.beginPath();
            let f = from();
            let t = to();
            context.moveTo(f.x, f.y);
            context.lineTo(t.x, t.y);
            context.stroke();
        });
    }
    readonly draw: DrawCallback;
    private constructor(draw: DrawCallback) {
        this.draw = context => {
            try {
                context.save();
                draw(context);
            } finally {
                context.restore();
            }
        };
    }
}

class CanvasContainer {
    context: CanvasRenderingContext2D;
    objects: View[];
    y: number = 0;
    advance: AdvanceCallback;

    constructor(canvas: HTMLCanvasElement, objects: View[], advance: AdvanceCallback) {
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