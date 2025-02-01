import Phaser from 'phaser';

const sizes = {
  width: 500,
  height: 500,
};
const speedDown = 150;

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.player;
    this.cursor;
    this.playerSpeed = speedDown + 50;
    this.target;
    this.points = 0;
    this.textScore;
    this.textTime;
    this.timedEvent;
    this.remainingTime;
  }

  preload() {
    this.load.image("bg", "assets/bg.png");
    this.load.image("basket", "assets/basket.png");
    this.load.image("apple", "assets/money.png");
  }

  create() {
    console.log("Phaser game initialized!");

    this.bg = this.add.image(0, 0, "bg").setOrigin(0, 0);
    this.player = this.physics.add.image(0, sizes.height - 100, "basket").setOrigin(0, 0);
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;

    this.target = this.physics.add.image(0, 0, "apple").setOrigin(0, 0);
    this.player.setSize(
      this.player.width / 10, 
      this.player.height - this.player.height / 6
    ).setOffset(
      this.player.width / 10, 
      this.player.height - this.player.height / 10
    );
    
    this.target.setMaxVelocity(0, speedDown);
    this.physics.add.overlap(this.target, this.player, this.targetHit, null, this);
    
    this.cursor = this.input.keyboard.createCursorKeys();
    this.player.setCollideWorldBounds(true);

    this.textScore = this.add.text(sizes.width - 120, 10, "Score: 0", {
      font: "25px Arial",
      fill: "#FFFFFF",
    });

    this.textTime = this.add.text(sizes.width - 120, 40, "Remaining Time: 0", {
      font: "25px Arial",
      fill: "#FFFFFF",
    });

    this.timedEvent = this.time.delayedCall(30000, this.gameOver, [], this);
  }

  update() {
    this.remainingTime = this.timedEvent.getRemainingSeconds();
    this.textTime.setText(`Remaining Time: ${Math.round(this.remainingTime)}`);

    if (this.target.y >= sizes.height) {
      this.target.setY(0);
      this.target.setX(this.getRandomX());
    }

    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }
  }

  gameOver() {
    console.log("Game Over!");
    this.scene.pause();
    this.add.text(sizes.width / 2 - 50, sizes.height / 2, "Game Over!", {
      font: "30px Arial",
      fill: "#FF0000",
    });
  }

  getRandomX() {
    return Math.floor(Math.random() * (sizes.width - 50));
  }

  targetHit() {
    this.target.setY(0);
    this.target.setX(this.getRandomX());
    this.points++;
    this.textScore.setText(`Score: ${this.points}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: sizes.width,
  height: sizes.height,
  parent: "gameContainer", // Attach to div instead of a pre-made canvas
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: false,
    },
  },
  scene: [GameScene],
};

new Phaser.Game(config);
