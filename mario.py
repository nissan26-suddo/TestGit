import pygame
import sys

# Initialize Pygame
pygame.init()

# Screen dimensions
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

# Player constants
PLAYER_WIDTH = 50
PLAYER_HEIGHT = 50
PLAYER_SPEED = 5
JUMP_STRENGTH = 15
GRAVITY = 1

class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((PLAYER_WIDTH, PLAYER_HEIGHT))
        self.image.fill(RED)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        self.vel_y = 0
        self.on_ground = False

    def update(self, platforms):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            self.rect.x -= PLAYER_SPEED
        if keys[pygame.K_RIGHT]:
            self.rect.x += PLAYER_SPEED
        if keys[pygame.K_SPACE] or keys[pygame.K_UP]:
            if self.on_ground:
                self.vel_y = -JUMP_STRENGTH
                self.on_ground = False

        self.vel_y += GRAVITY
        self.rect.y += self.vel_y

        # Collision detection with platforms
        self.on_ground = False
        for platform in platforms:
            if self.rect.colliderect(platform.rect):
                if self.vel_y > 0:
                    self.rect.bottom = platform.rect.top
                    self.vel_y = 0
                    self.on_ground = True

class Platform(pygame.sprite.Sprite):
    def __init__(self, x, y, width, height):
        super().__init__()
        self.image = pygame.Surface((width, height))
        self.image.fill(GREEN)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y


def main():
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("Simple Mario Game")

    clock = pygame.time.Clock()

    player = Player(100, SCREEN_HEIGHT - PLAYER_HEIGHT - 100)
    platforms = pygame.sprite.Group()
    ground = Platform(0, SCREEN_HEIGHT - 40, SCREEN_WIDTH, 40)
    platforms.add(ground)
    # Additional platform
    platforms.add(Platform(200, SCREEN_HEIGHT - 150, 100, 20))

    all_sprites = pygame.sprite.Group()
    all_sprites.add(player)
    all_sprites.add(ground)
    for p in platforms:
        if p != ground:
            all_sprites.add(p)

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        all_sprites.update(platforms)

        screen.fill(WHITE)
        all_sprites.draw(screen)
        pygame.display.flip()

        clock.tick(60)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
