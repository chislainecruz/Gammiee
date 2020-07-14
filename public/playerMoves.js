const playerMoves = self => {
  if (self.player && self.player.body) {
    if (!self.music.isPlaying && !self.music.isPaused) {
      self.music.play(self.soundConfig);
    }
    let onGround =
      self.player.body.blocked.down || self.player.body.touching.down;
    if (self.player.body.position.y > 2400) {
      self.player.x = 1100;
      self.player.y = 2300;
    }
    if (!self.player.anims.isPlaying && onGround) {
      self.player.anims.play(self.player.texture.key+'Walking');
    }
    if (self.cursors.left.isDown) {
      self.player.body.setVelocityX(-self.playerSpeed);

      self.player.flipX = false;
    } else if (self.cursors.right.isDown) {
      self.player.body.setVelocityX(self.playerSpeed);
      self.player.flipX = true;

      if (!self.player.anims.isPlaying && onGround) {
        self.player.anims.play(self.player.texture.key+'Walking');
      }
    } else {
      self.player.body.setVelocityX(0);
      self.player.anims.stop(self.player.texture.key+'Walking');
      // default pose
      self.player.setFrame(0);
    }
    // handle jumping
    if (onGround && (self.cursors.up.isDown)) {
      // give the player a velocity in Y
      self.jump.play(self.soundConfig);
      self.player.body.setVelocityY(self.jumpSpeed);
      self.player.anims.stop(self.player.texture.key+'Walking')
      // change frame
      self.player.setFrame(3);
    }

    let x = self.player.x;
    let y = self.player.y;
    let flipX = self.player.flipX;
    let frame;

    if (
      self.player.oldPosition &&
      (x !== self.player.oldPosition.x ||
        y !== self.player.oldPosition.y ||
        flipX !== self.player.oldPosition.flipX)
    ) {
      self.socket.emit('playerMovement', {
        x: self.player.x,
        y: self.player.y,
        flipX: self.player.flipX,
        frame: self.player.frame.name
      });

      self.name.x = self.player.x - 25 - (self.name.text.length * 2);
      self.name.y = self.player.y - 50;
    }

    self.player.oldPosition = {
      x: self.player.x,
      y: self.player.y,
      flipX: self.player.flipX,
    };
  }
};

export default playerMoves;
