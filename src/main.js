import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
	constructor() {
		super({ key: 'MainScene' });
	}

	preload() {
		// You can load assets here if needed
	}

	create() {
		// Add a simple red circle to the scene
		this.circle = this.add.circle(400, 300, 50, 0xff0000); // x, y, radius, color
		this.circle.setOrigin(0.5, 0.5); // Set origin to the center

		// Make the circle interactive
		this.circle.setInteractive();

		// Respond to input events (like clicking the circle)
		this.circle.on('pointerdown', () => {
			console.log('Circle clicked!');
		});

		// Set up a key input to move the circle
		this.cursors = this.input.keyboard.createCursorKeys();
	}

	update() {
		// Move the circle based on arrow key input
		const speed = 5;

		if (this.cursors.left.isDown) {
			this.circle.x -= speed;
		} else if (this.cursors.right.isDown) {
			this.circle.x += speed;
		}

		if (this.cursors.up.isDown) {
			this.circle.y -= speed;
		} else if (this.cursors.down.isDown) {
			this.circle.y += speed;
		}
	}
}

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: MainScene,
};

const game = new Phaser.Game(config);
