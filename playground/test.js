const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
    }

    moveTo(x, y) {
        this.prevX = this.x;
        this.prevY = this.y;
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

const entities = [
    new Entity(100, 100),
    new Entity(90, 100), 
    new Entity(80, 100)  
];

let mouseX = entities[0].x;
let mouseY = entities[0].y;

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

function update() {
    const head = entities[0];
    head.moveTo(mouseX, mouseY);

    for (let i = 1; i < entities.length; i++) {
        const leader = entities[i - 1];
        const follower = entities[i];

        const dx = leader.prevX - follower.x;
        const dy = leader.prevY - follower.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetDistance = 10;

        if (distance > targetDistance) {
            const angle = Math.atan2(dy, dx);
            follower.moveTo(
                follower.x + Math.cos(angle) * (distance - targetDistance),
                follower.y + Math.sin(angle) * (distance - targetDistance)
            );
        }
    }
}

(function loop() {
    update();
   
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const entity of entities) {
        entity.draw(ctx);
    }

    requestAnimationFrame(loop);
})();