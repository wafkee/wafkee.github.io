let keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

let width = 800;
let height = 600;

let started = false;

let speed = .5;
let spring = .05;
let springLength = 70;

let roadPieces = [];
let roadPieceLength = 50;
let currentPos = {
  x: -400,
  y: 0
};
let simplex = new SimplexNoise();

let barElem = document.getElementById("myBar");
let benzine = 100;

let tooSlowTimeout = null;
let benzineZeroTimeout = null;

let oldCoins = 0;
let coins = 0;

let savedCoins = parseInt(localStorage.getItem("hillCoins"));
if (savedCoins) {
  setCoins(savedCoins);
  oldCoins = savedCoins;
}

// module aliases
let Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Events = Matter.Events,
  Body = Matter.Body,
  Constraint = Matter.Constraint,
  Vertices = Matter.Vertices,
  Svg = Matter.Svg;

// create an engine
let engine = Engine.create();

// create a renderer
let render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    background: "dodgerblue"
  }
});

// create two boxes and a ground
let car = Bodies.fromVertices(300, 100, [{
  x: 160,
  y: 0
}, {
  x: 220,
  y: 50
}, {
  x: 25,
  y: 50
}, {
  x: 25,
  y: 100
}, {
  x: 32,
  y: 100
}, {
  x: 37,
  y: 81
}, {
  x: 51,
  y: 67
}, {
  x: 70,
  y: 62
}, {
  x: 89,
  y: 67
}, {
  x: 103,
  y: 81
}, {
  x: 108,
  y: 100
}, {
  x: 192,
  y: 100
}, {
  x: 197,
  y: 81
}, {
  x: 211,
  y: 67
}, {
  x: 230,
  y: 62
}, {
  x: 249,
  y: 67
}, {
  x: 263,
  y: 81
}, {
  x: 268,
  y: 100
}, {
  x: 300,
  y: 100
}, {
  x: 300,
  y: 50
}, {
  x: 240,
  y: 50
}, {
  x: 180,
  y: 0
}], {
  render: {
    fillStyle: "crimson",
    lineWidth: 1,
    strokeStyle: "crimson"
  },
  label: "car"
});
let head = Bodies.circle(275, 50, 30, {
  render: {
    fillStyle: "navajowhite"
  },
  label: "head"
});
let headSpring = Constraint.create({
  bodyA: car,
  pointA: {
    x: -35,
    y: 0
  },
  length: 50,
  bodyB: head,
  stiffness: spring,
  damping: .05,
  render: {
    visible: false
  }
});
let wheelA = Bodies.circle(200, 160, 30, {
  render: {
    fillStyle: "#111"
  },
  friction: .8,
  label: "car"
});
let wheelB = Bodies.circle(400, 160, 30, {
  render: {
    fillStyle: "#111"
  },
  friction: .8,
  label: "car"
});

let springs = [createSpring(wheelA, -130, 0), createSpring(wheelA, -80, 0), createSpring(wheelB, 35, 0), createSpring(wheelB, 85, 0)];

// add all of the bodies to the world
World.add(engine.world, [car, head, headSpring, wheelA, wheelB, /*ground,*/ ...springs]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

Events.on(engine, "beforeUpdate", function (event) {
  if (benzine > 0) {
    if (started) {
      benzine -= .01;
      barElem.style.width = benzine + "%";
    }
    if (Object.values(keys).some((e) => e == true)) {
      benzine -= .05;
    }

    if (keys.d) {
      Body.setAngularVelocity(wheelA, speed);
      Body.setAngularVelocity(wheelB, speed);
    }
    if (keys.a) {
      Body.setAngularVelocity(wheelA, -speed);
      Body.setAngularVelocity(wheelB, -speed);
    }
    clearTimeout(benzineZeroTimeout);
    benzineZeroTimeout = null;
  } else {
    if (benzineZeroTimeout == null && started) benzineZeroTimeout = setTimeout(gameOver, 5000);
  }
  if (benzine >= 40) {
    barElem.style.background = "#4CAF50";
  }
  if (benzine < 40) {
    barElem.style.background = "#F5E73B";
  }
  if (benzine < 25) {
    barElem.style.background = "orange";
  }
  if (benzine < 10) {
    barElem.style.background = "red";
  }

  while (car.position.x > currentPos.x - width) addRoad();
  while (roadPieces.length * roadPieceLength > width * 4) {
    World.remove(engine.world, roadPieces[0]);
    roadPieces.shift();
  }

  if (car.velocity.x < .05) {
    if (tooSlowTimeout == null && started) tooSlowTimeout = setTimeout(gameOver, 5000);
  } else {
    clearTimeout(tooSlowTimeout);
    tooSlowTimeout = null;
  }

  // Volg speler
  Render.lookAt(render, car, {
    x: 400,
    y: 400
  });
});

Events.on(engine, 'collisionStart', function (event) {
  let pairs = event.pairs;
  let ee;
  let filteredHead = pairs.filter((e) => (e.bodyA.label == "head" && e.bodyB.label == "ground") || (e.bodyA.label == "ground" && e.bodyB.label == "head"));
  if (filteredHead.length > 0) {
    gameOver();
  }
  let filteredCoin = pairs.filter((e) => (e.bodyA.label == "car" && e.bodyB.label == "coin") || (e.bodyA.label == "coin" && e.bodyB.label == "car"));
  if (filteredCoin.length > 0) {
    setCoins(coins + 1);
    if (filteredCoin[0].bodyA.label == "coin") World.remove(engine.world, filteredCoin[0].bodyA);
    else World.remove(engine.world, filteredCoin[0].bodyB);
  }

  let filteredJerrycan = pairs.filter((e) => (e.bodyA.label == "car" && e.bodyB.label == "jerrycan") || (e.bodyA.label == "jerrycan" && e.bodyB.label == "car"));
  if (filteredJerrycan.length > 0) {
    benzine = 100;
    if (filteredJerrycan[0].bodyA.label == "jerrycan") World.remove(engine.world, filteredJerrycan[0].bodyA);
    else World.remove(engine.world, filteredJerrycan[0].bodyB);
  }
});

document.body.addEventListener("keydown", handleKeys);
document.body.addEventListener("keyup", handleKeys);
document.body.addEventListener("keyup", function (event) {
  if (event.key == "w") Body.applyForce(car, car.position, {
    x: 0,
    y: -1
  });
  if (event.key == "s") Body.applyForce(car, car.position, {
    x: 0,
    y: 1
  });
});

function handleKeys(event) {
  if (!started) started = true;
  keys[event.key] = event.type == "keydown";
}

function createSpring(wheel, x, y) {
  return Constraint.create({
    bodyA: car,
    pointA: {
      x,
      y
    },
    bodyB: wheel,
    stiffness: spring,
    damping: .05,
    length: springLength,
    render: {
      visible: false
    }
  });
}

function center(verts) {
  let total = verts.reduce((t, n) => ({
    x: t.x + n.x,
    y: t.y + n.y
  }));
  return {
    x: total.x / verts.length,
    y: total.y / verts.length
  };
}

function createRoadPiece(leftPos, rightPos) {
  let verts = [{
    x: leftPos.x,
    y: height * 3
  }, {
    x: leftPos.x,
    y: leftPos.y
  }, {
    x: rightPos.x,
    y: rightPos.y
  }, {
    x: rightPos.x,
    y: height * 3
  }];
  let c = center(verts);
  return Bodies.fromVertices(c.x, c.y, verts, {
    render: {
      fillStyle: "forestgreen",
      lineWidth: 1,
      strokeStyle: "forestgreen"
    },
    isStatic: true,
    label: "ground",
    friction: 1
  });
}

currentPos.y = getHeight(currentPos.x);
for (let i = 0; i < (width + 200) / roadPieceLength; i++) addRoad();

function addRoad() {
  let oldPos = currentPos;
  currentPos = {
    x: oldPos.x + roadPieceLength,
    y: getHeight(currentPos.x)
  };
  let piece = createRoadPiece(oldPos, currentPos);
  World.add(engine.world, piece);
  roadPieces.push(piece);
  if (currentPos.x > width) {
    if (Math.random() < .05) addCoin(currentPos.x);
    if (Math.random() < .005) addJerrycan(currentPos.x);
  }
}

function addCoin(x) {
  let y = getHeight(x) - 50;
  World.add(engine.world, Bodies.circle(x, y, 15, {
    render: {
      fillStyle: "gold"
    },
    label: "coin",
    isStatic: true
  }));
}

function addJerrycan(x) {
  let y = getHeight(x) - 50;
  World.add(engine.world, Bodies.rectangle(x, y, 10, 15, {
    render: {
      sprite: {
        texture: "/images/jerrycan.png",
        xScale: .2,
        yScale: .2
      }
    },
    label: "jerrycan",
    isStatic: true
  }));
}

function setCoins(n) {
  coins = n;
  document.querySelector("#coins").innerHTML = coins;
}

function gameOver() {
  localStorage.setItem("hillCoins", coins);
  alert("Game Over\nScore: " + (coins - oldCoins));
  location.reload();
}

function getHeight(x) {
  return height - simplex.noise2D(x / (height * 2), 0) * (currentPos.x / 100) - (.001 * currentPos.x) * simplex.noise2D(x / (height / 2), 1000);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}