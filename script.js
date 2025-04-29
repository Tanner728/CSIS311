const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const G = 6.6743 * (10 ** -3);
let bodies = [];
let animationId = null;

class Body {
  constructor(x, y, vx, vy, mass, color) {
    this.pos = [x, y];
    this.vel = [vx, vy];
    this.mass = mass;
    this.radius = Math.max(3, Math.log(mass)*2);
    this.color = color;
  }

  updatePosition() {
    this.pos[0] += this.vel[0];
    this.pos[1] += this.vel[1];
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.pos[0], this.pos[1], this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

function applyGravity(body1, body2) {
  const dx = body2.pos[0] - body1.pos[0];
  const dy = body2.pos[1] - body1.pos[1];
  const distance = Math.sqrt(dx ** 2 + dy ** 2);

  if (distance < body1.radius + body2.radius) return;

  const force = (G * body1.mass * body2.mass) / (distance ** 2);
  const angle = Math.atan2(dy, dx);

  const fx = Math.cos(angle) * force;
  const fy = Math.sin(angle) * force;

  body1.vel[0] += (fx / body1.mass);
  body1.vel[1] += (fy / body1.mass);
  body2.vel[0] -= (fx / body2.mass);
  body2.vel[1] -= (fy / body2.mass);
}

function drawCenterOfMass() {
  let totalMass = 0;
  let comX = 0;
  let comY = 0;

  for (const body of bodies) {
    totalMass += body.mass;
    comX += body.pos[0] * body.mass;
    comY += body.pos[1] * body.mass;
  }

  if (totalMass === 0) return;

  comX /= totalMass;
  comY /= totalMass;

  // Draw the crosshair
  ctx.beginPath();
  ctx.arc(comX, comY, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(comX - 10, comY);
  ctx.lineTo(comX + 10, comY);
  ctx.moveTo(comX, comY - 10);
  ctx.lineTo(comX, comY + 10);
  ctx.strokeStyle = "white";
  ctx.stroke();
  ctx.closePath();

  // Draw the label
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText("Center of Mass", comX + 12, comY - 12);
}

function updateSimulation() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      applyGravity(bodies[i], bodies[j]);
    }
  }

  for (const body of bodies) {
    body.updatePosition();
    body.draw();
  }

  animationId = requestAnimationFrame(updateSimulation);
}

function startSimulation() {
  bodies = [];

  const x1 = parseFloat(document.getElementById("x1").value);
  const y1 = parseFloat(document.getElementById("y1").value);
  const vx1 = parseFloat(document.getElementById("vx1").value);
  const vy1 = parseFloat(document.getElementById("vy1").value);
  const m1 = parseFloat(document.getElementById("m1").value);

  const x2 = parseFloat(document.getElementById("x2").value);
  const y2 = parseFloat(document.getElementById("y2").value);
  const vx2 = parseFloat(document.getElementById("vx2").value);
  const vy2 = parseFloat(document.getElementById("vy2").value);
  const m2 = parseFloat(document.getElementById("m2").value);

  const body1 = new Body(x1, y1, vx1, vy1, m1, "#ff4136");
  const body2 = new Body(x2, y2, vx2, vy2, m2, "#0074D9");

  bodies.push(body1, body2);
  updateSimulation();
}

function stopSimulation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function resetSimulation() {
  stopSimulation();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("x1").value = centerX - 100;
  document.getElementById("y1").value = centerY;
  document.getElementById("x2").value = centerX + 100;
  document.getElementById("y2").value = centerY;
}

// Initialize default positions to center of screen
resetSimulation();

//if logged in you can see the save and load buttons, otherwise you cant
window.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const logoutBtn = document.getElementById('logoutBtn');
  const saveBtn = document.getElementById('saveBtn'); 
  const loadBtn = document.getElementById('loadBtn');

  if (isLoggedIn === 'true') {
    logoutBtn.style.display = 'block';
    if (saveBtn) saveBtn.style.display = 'inline-block';
    if (loadBtn) loadBtn.style.display = 'inline-block';
  } else {
    logoutBtn.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'none';
    if (loadBtn) loadBtn.style.display = 'none';
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
  });
});


//save settings to a run locally
function saveToLocal() {
  const user = localStorage.getItem("isLoggedIn");
  if (!user) {
    alert("You must be logged in to save your simulation.");
    return;
  }

  const params = {
    x1: document.getElementById("x1").value,
    y1: document.getElementById("y1").value,
    vx1: document.getElementById("vx1").value,
    vy1: document.getElementById("vy1").value,
    m1: document.getElementById("m1").value,
    x2: document.getElementById("x2").value,
    y2: document.getElementById("y2").value,
    vx2: document.getElementById("vx2").value,
    vy2: document.getElementById("vy2").value,
    m2: document.getElementById("m2").value
  };

  localStorage.setItem(`savedSimulation-${user}`, JSON.stringify(params));
  alert("Simulation saved for " + user + "!");
}

//load the settings saved
function loadFromLocal() {
  const user = localStorage.getItem("isLoggedIn");
  if (!user) {
    alert("You must be logged in to load saved simulations.");
    return;
  }

  const saved = localStorage.getItem(`savedSimulation-${user}`);
  if (!saved) {
    alert("No saved simulation found for " + user);
    return;
  }

  const params = JSON.parse(saved);

  document.getElementById("x1").value = params.x1;
  document.getElementById("y1").value = params.y1;
  document.getElementById("vx1").value = params.vx1;
  document.getElementById("vy1").value = params.vy1;
  document.getElementById("m1").value = params.m1;

  document.getElementById("x2").value = params.x2;
  document.getElementById("y2").value = params.y2;
  document.getElementById("vx2").value = params.vx2;
  document.getElementById("vy2").value = params.vy2;
  document.getElementById("m2").value = params.m2;

  alert("Loaded saved settings for " + user);
}