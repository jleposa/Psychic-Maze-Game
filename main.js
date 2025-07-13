const TILE_SIZE = 32;
const MAZE = [
  '####################',
  '#..P.........#.....#',
  '#.####.#####.#.###.#',
  '#.#  #.#   #.#.# #.#',
  '#.#  #.#####.#.# #.#',
  '#.#    #   #...# #.#',
  '#.##### # # #####.#',
  '#.....#   #       #',
  '###.#.###########.#',
  '#...#.............#',
  '####################'
];

class MazeScene extends Phaser.Scene {
  constructor() { super('MazeScene'); }

  create() {
    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.WASD    = this.input.keyboard.addKeys('W,A,S,D');

    // Groups
    this.walls = this.physics.add.staticGroup();
    this.orbs  = this.physics.add.group();

    let startX = 0, startY = 0;

    // Build maze
    MAZE.forEach((row, y) => {
      row.split('').forEach((ch, x) => {
        const px = x * TILE_SIZE, py = y * TILE_SIZE;
        if (ch === '#') {
          const wall = this.add.rectangle(px + TILE_SIZE/2, py + TILE_SIZE/2,
                                         TILE_SIZE, TILE_SIZE, 0x555555);
          this.physics.add.existing(wall, true);
          this.walls.add(wall);
        } else if (ch === 'P') {
          startX = px + TILE_SIZE/2;
          startY = py + TILE_SIZE/2;
        } else if (ch === '.') {
          const orb = this.add.circle(px + TILE_SIZE/2, py + TILE_SIZE/2,
                                      TILE_SIZE/4, 0xffff00);
          this.physics.add.existing(orb);
          orb.body.setCircle(TILE_SIZE/4);
          this.orbs.add(orb);
        }
      });
    });

    // Player (blue square)
    this.player = this.add.rectangle(startX, startY,
                                    TILE_SIZE*0.8, TILE_SIZE*0.8, 0x0000ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Collisions & pickups
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.orbs, (p, orb) => {
      orb.destroy();
      this.score++;
      document.getElementById('score').textContent = this.score;
    });

    // Initialize score
    this.score = 0;
  }

  update() {
    const speed = 120;
    const body = this.player.body;
    body.setVelocity(0);

    if (this.cursors.left.isDown  || this.WASD.A.isDown) body.setVelocityX(-speed);
    if (this.cursors.right.isDown || this.WASD.D.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown    || this.WASD.W.isDown) body.setVelocityY(-speed);
    if (this.cursors.down.isDown  || this.WASD.S.isDown) body.setVelocityY(speed);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: MAZE[0].length * TILE_SIZE,
  height: MAZE.length     * TILE_SIZE,
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [ MazeScene ]
};

new Phaser.Game(config);
