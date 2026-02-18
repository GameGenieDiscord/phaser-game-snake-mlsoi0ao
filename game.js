// snake - Phaser.js Game

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Create simple textures programmatically
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Snake head texture (orange square)
        graphics.fillStyle(0xff9900);
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('head', 16, 16);
        
        // Snake body texture (slightly darker orange)
        graphics.clear();
        graphics.fillStyle(0xe68000);
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('body', 16, 16);
        
        // Food texture (red square)
        graphics.clear();
        graphics.fillStyle(0xff0000);
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('food', 16, 16);
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // Grid settings
        this.gridSize = 16;
        this.cols = Math.floor(800 / this.gridSize);
        this.rows = Math.floor(600 / this.gridSize);
        
        // Snake array (head first) - start with 3 segments
        const startX = Math.floor(this.cols / 2);
        const startY = Math.floor(this.rows / 2);
        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        this.direction = { x: 1, y: 0 };
        this.lastMoveTime = 0;
        this.moveDelay = 150; // ms between moves
        
        // Score
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        // Food
        this.food = this.placeFood();
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Draw initial state
        this.drawGame();
        
        // Game over flag
        this.gameOver = false;
        
        // Game over container
        this.gameOverContainer = this.add.container(400, 300);
        
        // Background panel
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.8);
        panel.fillRoundedRect(-150, -80, 300, 160, 16);
        
        // Game over text
        const gameOverLabel = this.add.text(0, -40, 'GAME OVER', {
            fontSize: '36px',
            fill: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Restart instruction
        const restartLabel = this.add.text(0, 10, 'Press SPACE to restart', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Add panel and texts to container
        this.gameOverContainer.add([panel, gameOverLabel, restartLabel]);
        this.gameOverContainer.setVisible(false);
        
        // Space key for restart
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update(time) {
        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.scene.restart();
            }
            return;
        }
        
        // Handle input for direction change
        if (this.cursors.left.isDown && this.direction.x === 0) {
            this.direction = { x: -1, y: 0 };
        } else if (this.cursors.right.isDown && this.direction.x === 0) {
            this.direction = { x: 1, y: 0 };
        } else if (this.cursors.up.isDown && this.direction.y === 0) {
            this.direction = { x: 0, y: -1 };
        } else if (this.cursors.down.isDown && this.direction.y === 0) {
            this.direction = { x: 0, y: 1 };
        }
        
        // Move snake based on time
        if (time - this.lastMoveTime > this.moveDelay) {
            this.moveSnake();
            this.lastMoveTime = time;
        }
    }
    
    moveSnake() {
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // Check wall collision
        if (newHead.x < 0 || newHead.x >= this.cols || newHead.y < 0 || newHead.y >= this.rows) {
            this.endGame();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (newHead.x === segment.x && newHead.y === segment.y) {
                this.endGame();
                return;
            }
        }
        
        // Add new head
        this.snake.unshift(newHead);
        
        // Check food collision
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
            this.food = this.placeFood();
            // Slightly increase speed
            this.moveDelay = Math.max(80, this.moveDelay - 3);
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
        
        this.drawGame();
    }
    
    placeFood() {
        let foodPos;
        do {
            foodPos = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
        } while (this.snake.some(seg => seg.x === foodPos.x && seg.y === foodPos.y));
        return foodPos;
    }
    
    drawGame() {
        // Clear previous sprites
        this.children.removeAll(true);
        
        // Re-add UI texts
        this.add.existing(this.scoreText);
        if (this.gameOver) {
            this.add.existing(this.gameOverContainer);
        }
        
        // Draw food
        const foodSprite = this.add.sprite(this.food.x * this.gridSize + this.gridSize / 2, this.food.y * this.gridSize + this.gridSize / 2, 'food');
        foodSprite.setOrigin(0.5);
        
        // Draw snake
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const sprite = this.add.sprite(segment.x * this.gridSize + this.gridSize / 2, segment.y * this.gridSize + this.gridSize / 2, i === 0 ? 'head' : 'body');
            sprite.setOrigin(0.5);
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.gameOverContainer.setVisible(true);
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: MainScene
};

// Initialize game
const game = new Phaser.Game(config);