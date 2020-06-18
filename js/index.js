// Based on http://drilian.com/2009/02/25/lightning-bolts/

let canvas, ctx;
let mouseIn = false;
let mouse;
let center;

let maximumOffset = 80;
let bolts = [];
let evolutionMax = 6;
let count = 16;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.drawingContext;
  center = createVector(width / 2, height / 2);
  canvas.canvas.onmouseenter = () => mouseIn = true;
  canvas.canvas.onmouseleave = () => mouseIn = false;
  for (let i = 0; i < count; i++) {
    addBolt();
  }
}

function addBolt() {
  // let a = map(random(), 0, 1, PI * 0.75, PI * 2.25);
  let a = map(random(), 0, 1, 0, TAU);
  let r = random(200, 300);
  let x = cos(a) * r;
  let y = sin(a) * r;
  let start = center.copy().add(x / 4, y / 4);
  let end = center.copy().add(x, y);
  if (mouseIn && mouse) {
    let mouseDist = mouse.dist(start);
    if (mouseDist < 250) {
      end = mouse;
    }
  }
  let bolt = new Bolt(
  start,
  end);

  bolt.reset();
  bolts.push(bolt);
}

function draw() {
  // background(0);
  noStroke();
  fill(0, 80);
  rect(0, 0, width, height);

  fill(0);
  strokeWeight(4);
  stroke(255);
  rect(width / 2 - 40, height / 2, 80, height);
  ellipse(width / 2, height / 2, 150);

  noFill();
  stroke(255, 20);
  // blendMode(ADD);

  center = createVector(width / 2, height / 2);
  if (mouseIn) {
    mouse = createVector(mouseX, mouseY);

    let mouseDist = mouse.dist(center);
    if (mouseDist < 250) {
      canvas.canvas.style.cursor = 'pointer';
    } else
    {
      canvas.canvas.style.cursor = 'default';
    }
  }

  bolts.forEach((n, i) => {
    let r = frameCount + i * 5;
    // let timeToReset = r % 8 === 1;
    let timeToEvolve = r % 4 === 1;
    if (n.evolutions >= evolutionMax) {
      // n.end.add(p5.Vector.random2D().mult(5)); // Random Walkers
      // n.reset();
      bolts.splice(i, 1);
      addBolt();
    }
    if (timeToEvolve) {
      n.evolve();
    }
    n.render();
  });

  // 	blendMode(BLEND);

  // 	noStroke();
  // 	fill(100, 0, 50, 50);
  // 	ellipse(width / 2, height / 2, 600);
  // 	noFill();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Bolt {
  constructor(start, end) {
    if (start instanceof p5.Vector) {
      this.start = start.copy();
      this.end = end.copy();
    } else
    {
      this.start = createVector(...start);
      this.end = createVector(...end);
    }

    this.segmentList = [];
    this.offsetAmount = maximumOffset;
    this.evolutions = 0;
  }

  reset() {
    this.segmentList.splice(0, this.segmentList.length);
    this.segmentList.push(new Segment(this.start, this.end));
    this.offsetAmount = maximumOffset;
    this.evolutions = 0;
    return this;
  }

  evolve() {
    if (this.evolutions < evolutionMax) {
      this.evolutions++;
      this.segmentList.forEach((n, i) => {
        this.segmentList.splice(i, 1);

        let midPoint = n.break(this.offsetAmount);

        this.addSegment(n.start, midPoint);
        this.addSegment(midPoint, n.end);

        if (random() < 0.3) {
          let direction = p5.Vector.sub(midPoint, n.start);
          let rot = random(-PI / 32, PI / 32);
          let splitEnd = direction.rotate(rot).mult(0.7).add(midPoint);
          this.addSegment(midPoint, splitEnd);
        }
      });

      this.offsetAmount /= 2;
    }

    return this;
  }

  addSegment(start, end) {
    let segment = new Segment(start, end);
    this.segmentList.push(segment);
  }

  render() {
    // let found = false;
    this.segmentList.forEach(n => {
      let dist = n.end.dist(this.end);

      let weight = dist / 150;
      // if(!found && weight <= 0.6) {
      // 	found = true;
      // 	let w = 4;
      // 	let r = 32;
      // 	strokeWeight(w);
      // 	stroke(255, 10);
      // 	let d = p5.Vector.sub(createVector(width / 2, height / 2), n.end).limit(r - w).add(n.end);
      // 	ellipse(d.x, d.y, r);
      // }
      stroke(255, weight * 150);
      strokeWeight(weight);
      n.render();
    });
    return this;
  }}


class Segment {
  constructor(start, end) {
    if (start instanceof p5.Vector) {
      this.start = start.copy();
      this.end = end.copy();
    } else
    {
      this.start = createVector(...start);
      this.end = createVector(...end);
    }
  }

  break(offsetAmount) {
    let midPoint = p5.Vector.add(this.start, this.end).div(2);
    let rot = random(HALF_PI) + QUARTER_PI;
    let perp = p5.Vector.sub(this.end, this.start).normalize().rotate(rot);

    perp.mult(random(-offsetAmount, offsetAmount));
    midPoint.add(perp);

    return midPoint;
    return this;
  }

  render() {
    // let d = 20;
    // ellipse(this.start.x, this.start.y, d);
    // ellipse(this.end.x, this.end.y, d);
    line(this.start.x, this.start.y, this.end.x, this.end.y);
    return this;
  }}