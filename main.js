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
  constructor() {
    super('MazeScene');
  }

  preload() {
    this.load.image('wall', 'https://i.imgur.com/3e5wNCZ.png');
    this.load.spritesheet('wizard', 'https://i.imgur.com/Wb1F1Y3.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image('orb', 'https://i.imgur.com/3UoFGx4.png');
  }

  create() {
    // Enable 2D lighting
    this.lights.enable().setAmbientColor(0x111111);

    // Build maze
    this.walls = this.physics.add.staticGroup();
    this.orbs  = this.physics.add.group();
    let startX, startY;

    MAZE.forEach((row, y) => {
      row.split('').forEach((ch, x) => {
        const px = x * TILE_SIZE, py = y * TILE_SIZE;
        if (ch === '#') {
          this.walls.create(px, py, 'wall').setOrigin(0).setPipeline('Light2D');
        } else if (ch === 'P') {
          startX = px; startY = py;
        } else if (ch === '.') {
          const orb = this.orbs.create(px + TILE_SIZE/2, py + TILE_SIZE/2, 'orb');
          orb.setPipeline('Light2D');
        }
      });
    });

    // Player sprite
    this.player = this.physics.add.sprite(startX, startY, 'wizard', 0)
      .setOrigin(0)
      .setDepth(1)
      .setPipeline('Light2D');
    this.player.body.setSize(28, 28).setOffset(2, 2);

    // Staff light
    this.playerLight = this.lights.addLight(startX + 16, startY + 16, 150)
      .setColor(0xffffff)
      .setIntensity(2);

    // Collisions & overlaps
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.orbs, this.collectOrb, null, this);

    // Walking animation
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('wizard', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.WASD    = this.input.keyboard.addKeys('W,A,S,D');

    // Score
    this.score = 0;
  }

  collectOrb(player, orb) {
    orb.destroy();
    this.score++;
    document.getElementById('score').textContent = this.score;
  }

  update() {
    const speed = 100;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown || this.WASD.A.isDown)  vx = -speed;
    if (this.cursors.right.isDown|| this.WASD.D.isDown)  vx = speed;
    if (this.cursors.up.isDown   || this.WASD.W.isDown)  vy = -speed;
    if (this.cursors.down.isDown || this.WASD.S.isDown)  vy = speed;

    this.player.setVelocity(vx, vy);
    if (vx || vy) {
      this.player.anims.play('walk', true);
    } else {
      this.player.anims.stop();
    }

    // Move light with player
    this.playerLight.x = this.player.x + 16;
    this.playerLight.y = this.player.y + 16;
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: MAZE[0].length * TILE_SIZE,
  height: MAZE.length * TILE_SIZE,
  pixelArt: true,
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [ MazeScene ]
};

new Phaser.Game(config);
