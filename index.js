const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
});

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/samuraiMack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/samuraiMack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/samuraiMack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 160,
    height: 50
  }
});

const enemy = new Fighter({
  position: {
    x: 700,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50
    },
    width: 170,
    height: 50
  }
});

console.log(player);

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
};

decreaseTimer();

const enemyAttackDelay = 1000; // Adjust the delay between enemy attacks (in milliseconds)
let lastAttackTime = 0; // Variable to track the last attack time

function updateAI() {
  if (!enemy.dead) { // Check if enemy is not dead
      // Example: AI follows the player
      if (player.position.x < enemy.position.x) {
          enemy.velocity.x = -3; // Move left
      } else if (player.position.x > enemy.position.x) {
          enemy.velocity.x = 3; // Move right
      }

      // Example: AI attacks when close to the player
      if (Math.abs(player.position.x - enemy.position.x) < 100) {
          // Check if enough time has passed since the last attack
          const currentTime = Date.now();
          if (currentTime - lastAttackTime > enemyAttackDelay) {
              enemy.attack();
              lastAttackTime = currentTime; // Update the last attack time
          }
      } else {
          // Stop attacking if not close to the player
          enemy.isAttacking = false;
      }

      // Update enemy sprite based on velocity
      if (enemy.velocity.x !== 0) {
          enemy.switchSprite('run');
      } else {
          enemy.switchSprite('idle');
      }
  }
}

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = 'rgba(255, 255, 255, 0.15)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;


  // Player movement
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5;
    player.switchSprite('run');
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5;
    player.switchSprite('run');
  } else {
    player.switchSprite('idle');
  }

  // Jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump');
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall');
  }

  // AI Logic
  updateAI();

  // Collision detection & player attacking
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    });
  }

  // Player missing
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  // Player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;

    gsap.to('#playerHealth', {
      width: player.health + '%'
    });
  }

  // AI missing
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  // End game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();


window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true;
        player.lastKey = 'd';
        break;
      case 'a':
        keys.a.pressed = true;
        player.lastKey = 'a';
        break;
      case 'w':
        player.velocity.y = -20;
        break;
      case ' ':
        player.attack();
        break;
    }
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
  }
});


// Function to handle both touch and click events
function handleButtonClick(callback) {
return function(event) {
  event.preventDefault();
  callback();
};
}
// attack
document.getElementById('btn-attack').addEventListener('click', handleButtonClick(() => {
  player.attack();
  }));

// Function to handle continuous button press
function handleContinuousPress(buttonId, velocity) {
  const button = document.getElementById(buttonId);
  let intervalId;

  const movePlayer = () => {
      // Check if the player is already moving
      const isAlreadyMoving = Math.abs(player.velocity.x) > 0;

      player.velocity.x = velocity;

      // Change sprite to 'run' only if the player starts moving
      if (player.velocity.x !== 0) {
        player.switchSprite('run');
    } else {
        player.switchSprite('idle');
    }
}

  button.addEventListener('mousedown', () => {
      movePlayer();
      intervalId = setInterval(movePlayer, 1000 / 60); // Adjust the interval for smoother movement
  });

  button.addEventListener('touchstart', () => {
      movePlayer();
      intervalId = setInterval(movePlayer, 1000 / 60); // Adjust the interval for smoother movement
  });

  button.addEventListener('mouseup', () => {
      clearInterval(intervalId);
      player.velocity.x = 0;
      player.switchSprite('idle'); // Change sprite to 'idle' when button is released and player stops moving

    });

  button.addEventListener('touchend', () => {
      clearInterval(intervalId);
      player.velocity.x = 0;
      player.switchSprite('idle'); // Change sprite to 'idle' when button is released and player stops moving
  });
}

// Add event listeners for continuous button presses
handleContinuousPress('btn-left', -6); // Move left with velocity -5
handleContinuousPress('btn-right', 6); // Move right with velocity 5