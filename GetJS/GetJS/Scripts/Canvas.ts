interface DrawCallback {
    (context: CanvasRenderingContext2D): void;
}
interface AdvanceCallback {
    (): void;
}

interface Box {
    readonly position: Vector;
    readonly size: Vector;
    readonly angle: number;
}
interface Spring {
    from(): Vector;
    to(): Vector;
}


class View {
    static combine(views: View[], offset: Vector) {
        return new View(context => {
            views.forEach(x => x.draw(context));
        }, offset);
    }
    static createBox(box: Box): View {
        return new View(context => {
            let pos = box.position;
            context.translate(pos.x, pos.y)
            context.rotate(box.angle);
            context.fillStyle = "white";
            context.fillRect(-box.size.x / 2, -box.size.y / 2, box.size.x, box.size.y);
        });
    }
    static createSpring(spring: Spring): View {
        return new View(context => {
            context.strokeStyle = "green";
            context.beginPath();
            let f = spring.from();
            let t = spring.to();
            context.moveTo(f.x, f.y);
            context.lineTo(t.x, t.y);
            context.stroke();
        });
    }
    readonly draw: DrawCallback;
    private constructor(draw: DrawCallback, offset?: Vector) {
        this.draw = context => {
            try {
                context.save();
                if (offset)
                    context.translate(offset.x, offset.y);
                draw(context);
            } finally {
                context.restore();
            }
        };
    }
}

class Simulation {
    static createSimulation(canvas: HTMLCanvasElement, objects: View[], advance: AdvanceCallback, step: number) {
        const context = canvas.getContext("2d");
        let lastTime = 0;
        let elapsedTime = 0;
        let simulationTime = 0;
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
                    advance();
                    simulationTime += step;
                }
                draw();
                
            } else if (oneFrame) {
                //TODO duplicate code
                clear();
                advance();
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