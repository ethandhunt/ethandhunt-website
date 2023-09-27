FORCE_MUL = 0.1
FRICTION_NUM = 100

a = 5
c = 5
function force_formula(r, D1, D2) {
    b = c/(1/(D1+D2)**a - 1/(2*(D1+D2))**a)
    d = -3*(D1+D2)
    if (r < D1 + D2) {
        return (b/r**a - b/(D1+D2)**a - c)*FORCE_MUL
    } else {
        return (d/r)*FORCE_MUL
    }
}
class particle {
    constructor(pos, vel, eq_rad) {
        // eq_rad: equilibrium radius
        this.pos = pos
        this.vel = vel
        this.eq_rad = eq_rad
        this.id = Math.random()
    }

    force_calc_1(other_particle) {
        let p = other_particle
        let distance = this.pos.dist(p.pos)

        let force = this.pos.copy()
        force.sub(p.pos)
        force.normalize()
        force.mult(force_formula(distance, this.eq_rad, p.eq_rad))

        return force
    }

    force_calc_n(particle_list) {
        let net_force = new p5.Vector()

        for (let i=0; i<particle_list.length; i++) {
            let p = particle_list[i]
            if (p.id == this.id) {continue}

            net_force.add(this.force_calc_1(p))
        }

        return net_force
    }

    draw_force(particle_list) {
        for (let i=0; i<particle_list.length; i++) {
            if (particle_list[i].id == this.id) {continue}
            let f = this.force_calc_1(particle_list[i])
            line(this.pos.x, this.pos.y, this.pos.x+f.x*50, this.pos.y+f.y*50)
        }
    }

    draw() {
        push()
        noFill()

        point(this.pos.x, this.pos.y)
        circle(this.pos.x, this.pos.y, this.eq_rad)

        pop()
    }

    update_vel(particle_list, scalar=1) {
        this.vel.add(this.force_calc_n(particle_list).mult(scalar))
        this.vel.mult(1-(scalar/FRICTION_NUM))
    }
    
    update_pos(scalar=1) {
        this.pos.add(this.vel.copy().mult(scalar))
    }
}

SUBSTEPS = 10
function simulate(list) {
    for (let i=0; i<SUBSTEPS; i++) {
        for (let j=0; j<list.length; j++) {
            list[j].update_vel(list, 1/SUBSTEPS)
        }
        for (let j=0; j<list.length; j++) {
            list[j].update_pos(1/SUBSTEPS)
        }
    }
}

function rand_range(lo, hi) {
    return (Math.random()*(hi-lo) + lo)
}

function mouseClicked() {
    p_list.push(new particle(new p5.Vector(mouseX, mouseY), new p5.Vector(), 30))
}

p_list = []
function setup() {
    createCanvas(windowWidth, windowHeight)
    for (let i=0; i<2; i++) {
        p_list.push(new particle(new p5.Vector(rand_range(width/2-50, width/2+50), rand_range(height/2-50, height/2+50)), new p5.Vector(), 30))
    }
}

function draw() {
    background(0)
    stroke(255)
    
    simulate(p_list)

    for (let i=0; i<p_list.length; i++) {
        p = p_list[i]
        if (!((0 <= p.pos.x && p.pos.x <= width) && (0 <= p.pos.y && p.pos.y <= height))) {
            p_list.pop(i)
            console.log('popped', i)
            i--
        }
        p.draw()
        p.draw_force(p_list)
    }

}