class Simulations {
    static createBallisticTrajectory(): PhysicsSetup {
        return {
            boxes: [createBox(new Vector(9, 13), 100, new Vector(0, 0), new Vector(80, -40), 1, 2)],
            forceFields: [Physics.createGravity(100)],
            springs: [],
        }
    }
    static createUnbalancedSpringPendulum(): PhysicsSetup {
        let boxSize = new Vector(100, 20);
        let box = createBox(boxSize, 100, new Vector(0, 400), new Vector(0, 0));
        return {
            boxes: [box],
            forceFields: [Physics.createGravity(100)],
            springs: [ Physics.createFixedSpring(250, new Vector(0, 0), box, new Vector(boxSize.x / 2, 0)) ]
        }
    }
    static createUnbalancedSpringPendulum_noGravity(): PhysicsSetup {
        let boxSize = new Vector(100, 20);
        let box = createBox(boxSize, 100, new Vector(0, 300), new Vector(0, 0));
        return {
            boxes: [box],
            forceFields: [],
            springs: [Physics.createFixedSpring(350, new Vector(0, 0), box, new Vector(boxSize.x / 2, 0))]
        }
    }
    static createDoubleUnbalancedSpringPendulum(): PhysicsSetup {
        let boxSize3 = new Vector(100, 20);
        let box3 = createBox(boxSize3, 100, new Vector(0, 200), new Vector(0, 0));
        let box3_ = createBox(boxSize3, 100, new Vector(0, 400), new Vector(0, 0));
        let spring3 = Physics.createFixedSpring(500, new Vector(0, 0), box3, new Vector(boxSize3.x / 2, 0));
        let spring3_ = Physics.createDynamicSpring(500, box3, new Vector(-boxSize3.x / 2, 0), box3_, new Vector(boxSize3.x / 2, 0));
        return {
            boxes: [box3, box3_],
            forceFields: [Physics.createGravity(100)],
            springs: [spring3, spring3_]
        }
    }
    static createBalancedRotatingBoxes(): PhysicsSetup {
        let boxSize = new Vector(100, 20);
        let box1 = createBox(boxSize, 100, new Vector(0, -200), new Vector(0, 0));
        let box2 = createBox(boxSize, 100, new Vector(0, 200), new Vector(0, 0));
        let spring =
            Physics.createDynamicSpring(500, box1, new Vector(-boxSize.x / 2, 0), box2, new Vector(boxSize.x / 2, 0));
            //Physics.createDynamicSpring(500, model1.value, new Vector(0, 0), model2.value, new Vector(0, 0))
        
        return {
            boxes: [box1, box2],
            forceFields: [],
            springs: [spring]
        }
    }
    static createPushPullSwing(): PhysicsSetup {
        let boxSize = new Vector(100, 20);
        //let model = ModelFactory.createBoxModel(boxSize, 100, new Vector(300, 300), new Vector(0, 0));
        let box = createBox(boxSize, 100, new Vector(0, 0), new Vector(0, 0));

        let spring1 = Physics.createFixedSpring(500, new Vector(0, -200), box, new Vector(boxSize.x / 2, 0));
        let spring2 = Physics.createFixedSpring(500, new Vector(0, 200), box, new Vector(-boxSize.x / 2, 0));

        return {
            boxes: [box],
            forceFields: [],
            springs: [spring1, spring2]
        }
    }

}

//class ArrayHelper {
//    static selectMany<TValue, T>(values: Array<TValue>, selector: (value: TValue) => T[]) {
//        let res = new Array<T>();
//        values.forEach(x => selector(x).forEach(y => res.push(y)))
//        return res;
//    }
//}



function createSimulation(canvas: HTMLCanvasElement, setups: [PhysicsSetup, Vector][], debug: (debug: string) => void) {
    let physices = setups.map(([x, o]) => Physics.create(x));
    let views = setups.map(([x, o]) => View.combine(x.boxes.map(View.createBox).concat(x.springs.map(View.createSpring)), o));
    let count = 0;
    return Simulation.createSimulation(
        canvas,
        views,
        dt => physices.forEach(x => {
            x.advance(dt);
            let res = "";
            physices.forEach(x => res += Math.round(totalEnergy(x)) + "<br/>");
            count++;
            if (count % 20 == 0)
                debug(res);
        }));
}
function totalEnergy(p: Physics) {
    //TODO test
    let res = 0;
    p.bodies.forEach(x => {
        res += BodyTraits.energy(x);
        p.forces.forEach(f => res += f.energy(x));
    });
    return res;
}


window.onload = () => {
    var el = document.getElementById('content');
    let span = document.createElement('span');
    el.appendChild(span);


    var simulation = createSimulation(
        <HTMLCanvasElement>document.getElementById('canvas'),
        [
            [Simulations.createBallisticTrajectory(), new Vector(200, 200)],
            [Simulations.createUnbalancedSpringPendulum(), new Vector(100, 100)],
            [Simulations.createDoubleUnbalancedSpringPendulum(), new Vector(300, 100)],
            [Simulations.createBalancedRotatingBoxes(), new Vector(500, 300)],
            [Simulations.createPushPullSwing(), new Vector(700, 300)],
            [Simulations.createUnbalancedSpringPendulum_noGravity(), new Vector(900, 300)],
        ],
        debug => span.innerHTML = debug
    );

    document.getElementById("pauseButton").addEventListener("click", event => {
        simulation.pause();
    });
    document.getElementById("resumeButton").addEventListener("click", event => {
        simulation.resume();
    });
    document.getElementById("stepButton").addEventListener("click", event => {
        simulation.step();
    });
    //document.addEventListener('keydown', event => {
    //    if (event.keyCode == 37) {
    //        //window.alert("Left Key Pressed");
    //    }
    //    else if (event.keyCode == 38) {
    //        canvas.up();
    //    }
    //    else if (event.keyCode == 39) {
    //        //window.alert("Right Key Pressed");
    //    }
    //    else if (event.keyCode == 40) {
    //        canvas.down();
    //    }
    //    else if (event.keyCode == 32) {
    //        //window.alert("Space Key Pressed");
    //    }
    //});
};