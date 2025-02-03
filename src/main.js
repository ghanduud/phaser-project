import Phaser from 'phaser';

class SpaceScene extends Phaser.Scene {
	constructor() {
		super({ key: 'SpaceScene' });
	}

	preload() {
		// Load assets
		this.load.image('stars', '../resources/stars.jpg');
		this.load.image('spaceship', '../resources/playerShip1_blue.png');
		this.load.image('meteorBrownSmall', '../resources/Meteors/meteorBrown_med1.png');
		this.load.image('meteorGreySmall', '../resources/Meteors/meteorGrey_med1.png');
		this.load.image('meteorBrownBig', '../resources/Meteors/meteorBrown_big1.png');
		this.load.image('meteorGreyBig', '../resources/Meteors/meteorGrey_big1.png');
	}

	create() {
		// Reset player health and timer
		this.playerHealth = 100;
		this.gameTime = 120;

		// Set background
		this.add
			.image(0, 0, 'stars')
			.setOrigin(0, 0)
			.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

		// Create the spaceship
		this.spaceship = this.physics.add.sprite(
			this.sys.game.config.width / 2,
			this.sys.game.config.height - 100,
			'spaceship'
		);
		this.spaceship.setCollideWorldBounds(true);

		// Enable smooth movement
		this.cursors = this.input.keyboard.createCursorKeys();

		// Create a meteor group
		this.meteors = this.physics.add.group();

		// Spawn meteors every second
		this.time.addEvent({ delay: 1000, callback: this.spawnMeteor, callbackScope: this, loop: true });

		// Collision detection
		this.physics.add.overlap(this.spaceship, this.meteors, this.hitMeteor, null, this);

		// Timer Text (top-left)
		this.timerText = this.add.text(20, 20, '00:00', { fontSize: '32px', fill: '#FFFFFF' });

		// Health Text (top-right)
		this.healthText = this.add.text(this.sys.game.config.width - 250, 20, 'Health: 100', {
			fontSize: '32px',
			fill: '#FFFFFF',
		});

		// Start countdown timer
		this.startTimer();
	}

	update() {
		if (this.cursors.left.isDown) {
			this.spaceship.setVelocityX(-300);
		} else if (this.cursors.right.isDown) {
			this.spaceship.setVelocityX(300);
		} else {
			this.spaceship.setVelocityX(0);
		}
	}

	spawnMeteor() {
		const meteorTypes = [
			{ key: 'meteorBrownSmall', damage: 10, scale: 1.0 },
			{ key: 'meteorGreySmall', damage: 10, scale: 1.0 },
			{ key: 'meteorBrownBig', damage: 30, scale: 1.5 },
			{ key: 'meteorGreyBig', damage: 30, scale: 1.5 },
		];

		const meteorData = Phaser.Utils.Array.GetRandom(meteorTypes);
		const x = Phaser.Math.Between(50, this.sys.game.config.width - 50);
		const meteor = this.meteors.create(x, -50, meteorData.key);
		meteor.setVelocityY(Phaser.Math.Between(100, 300));
		meteor.setGravityY(50);
		meteor.setScale(meteorData.scale);
		meteor.damageValue = meteorData.damage;
	}

	hitMeteor(spaceship, meteor) {
		this.playerHealth -= meteor.damageValue;
		this.healthText.setText(`Health: ${this.playerHealth}`);
		meteor.destroy();

		if (this.playerHealth <= 0) {
			this.restartGame();
		}
	}

	startTimer() {
		if (this.timerEvent) {
			this.timerEvent.remove();
		}
		this.timerEvent = this.time.addEvent({
			delay: 1000,
			callback: this.updateTimer,
			callbackScope: this,
			loop: true,
		});
	}

	updateTimer() {
		this.gameTime--;
		const minutes = Math.floor(this.gameTime / 60);
		const seconds = this.gameTime % 60;
		this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

		if (this.gameTime <= 0) {
			this.timerEvent.remove();
			this.winGame();
		}
	}

	winGame() {
		if (this.playerHealth > 0) {
			this.restartGame();
		}
	}

	restartGame() {
		if (this.timerEvent) {
			this.timerEvent.remove();
		}
		this.scene.restart();
	}
}

const config = {
	type: Phaser.AUTO,
	parent: 'game-container',
	width: window.innerWidth,
	height: window.innerHeight,
	physics: { default: 'arcade' },
	scene: [SpaceScene],
	scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
};

const game = new Phaser.Game(config);
