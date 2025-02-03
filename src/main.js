import Phaser from 'phaser';

class SpaceScene extends Phaser.Scene {
	constructor() {
		super({ key: 'SpaceScene' });
	}

	preload() {
		this.load.image('stars', '../resources/stars.jpg');
		this.load.image('spaceship', '../resources/playerShip1_blue.png');
		this.load.image('meteorBrownSmall', '../resources/Meteors/meteorBrown_med1.png');
		this.load.image('meteorGreySmall', '../resources/Meteors/meteorGrey_med1.png');
		this.load.image('meteorBrownBig', '../resources/Meteors/meteorBrown_big1.png');
		this.load.image('meteorGreyBig', '../resources/Meteors/meteorGrey_big1.png');
		this.load.image('healthPowerUp', '../resources/Power-ups/pill_green.png');
		this.load.image('speedPowerUp', '../resources/Power-ups/powerupYellow_bolt.png');
		this.load.image('speedMeteorsPowerDown', '../resources/Power-ups/powerupRed.png');
	}

	create() {
		this.playerHealth = 100;
		this.gameTime = 120;
		this.spaceshipSpeed = 300;
		this.meteorSpeedMultiplier = 1;

		this.add
			.image(0, 0, 'stars')
			.setOrigin(0, 0)
			.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

		this.spaceship = this.physics.add.sprite(
			this.sys.game.config.width / 2,
			this.sys.game.config.height - 100,
			'spaceship'
		);
		this.spaceship.setCollideWorldBounds(true);

		this.cursors = this.input.keyboard.createCursorKeys();
		this.meteors = this.physics.add.group();
		this.powerUps = this.physics.add.group();

		this.time.addEvent({ delay: 400, callback: this.spawnMeteor, callbackScope: this, loop: true });
		this.time.addEvent({ delay: 3000, callback: this.spawnPowerUp, callbackScope: this, loop: true });

		this.physics.add.overlap(this.spaceship, this.meteors, this.hitMeteor, null, this);
		this.physics.add.overlap(this.spaceship, this.powerUps, this.collectPowerUp, null, this);

		this.timerText = this.add.text(20, 20, '00:00', { fontSize: '32px', fill: '#FFFFFF' });
		this.healthText = this.add.text(this.sys.game.config.width - 250, 20, 'Health: 100', {
			fontSize: '32px',
			fill: '#FFFFFF',
		});

		this.startTimer();
	}

	update() {
		if (this.cursors.left.isDown) {
			this.spaceship.setVelocityX(-this.spaceshipSpeed);
		} else if (this.cursors.right.isDown) {
			this.spaceship.setVelocityX(this.spaceshipSpeed);
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
		meteor.setVelocityY(Phaser.Math.Between(100, 300) * this.meteorSpeedMultiplier);
		meteor.setGravityY(50);
		meteor.setScale(meteorData.scale);
		meteor.damageValue = meteorData.damage;
	}

	spawnPowerUp() {
		const powerUpTypes = ['healthPowerUp', 'speedPowerUp', 'speedMeteorsPowerDown'];
		const powerUpKey = Phaser.Utils.Array.GetRandom(powerUpTypes);
		const x = Phaser.Math.Between(50, this.sys.game.config.width - 50);
		const powerUp = this.powerUps.create(x, -50, powerUpKey);
		powerUp.setVelocityY(200);
		powerUp.powerUpType = powerUpKey;
	}

	collectPowerUp(spaceship, powerUp) {
		switch (powerUp.powerUpType) {
			case 'healthPowerUp':
				this.playerHealth = Math.min(100, this.playerHealth + 20);
				break;
			case 'speedPowerUp':
				this.spaceshipSpeed = 500;
				this.time.delayedCall(5000, () => (this.spaceshipSpeed = 300));
				break;
			case 'speedMeteorsPowerDown':
				this.meteorSpeedMultiplier = 1.5;
				this.meteorSpawnRate = 300;

				this.time.removeAllEvents();
				this.time.addEvent({
					delay: this.meteorSpawnRate,
					callback: this.spawnMeteor,
					callbackScope: this,
					loop: true,
				});

				this.time.delayedCall(5000, () => {
					this.meteorSpeedMultiplier = 1;
					this.meteorSpawnRate = 200;

					this.time.removeAllEvents();
					this.time.addEvent({
						delay: this.meteorSpawnRate,
						callback: this.spawnMeteor,
						callbackScope: this,
						loop: true,
					});
				});
				break;
		}
		this.healthText.setText(`Health: ${this.playerHealth}`);
		powerUp.destroy();
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
		this.restartGame();
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
