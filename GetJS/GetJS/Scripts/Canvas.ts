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

class Simulation {
    static createSimulation(canvas: HTMLCanvasElement, objects: View[], advance: AdvanceCallback) {
        const context = canvas.getContext("2d");
        let lastTime = 0;
        let elapsedTime = 0;
        let simulationTime = 0;
        const step = 1 / 60;;
        let pause = false;
        let oneFrame = false;

        const draw = () => objects.forEach(x => x.draw(context));
        const clear = () => {
            context.fillStyle = "black";
            context.fillRect(0, 0, 1280, 720);
        };

        let gameLoop = (time: number) => {
            requestAnimationFrame(gameLoop);

            if (!pause) {
                clear();
                let dt = (time - lastTime) / 1000;
                elapsedTime += dt;
                while (simulationTime < elapsedTime) {
                    advance(step);
                    simulationTime += step;
                }
                draw();
                
            } else if (oneFrame) {
                //TODO duplicate code
                clear();
                advance(step);
                draw();
                oneFrame = false;
            }

            lastTime = time;
        };


        requestAnimationFrame(gameLoop);

        return {
            pause: () => {
                pause = true;
            },
            resume: () => {
                pause = false;
            },
            step: () => {
                if (pause)
                    oneFrame = true;
            },
        };

        //context.fillStyle = "black";
        //context.fillRect(0, 0, 1280, 720);
    }
}