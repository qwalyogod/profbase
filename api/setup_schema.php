<?php
// /api/setup_schema.php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

try {
    $pdo = db();

    $sql = "
    -- Таблица системных и пользовательских ролей
    CREATE TABLE IF NOT EXISTS roles (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        is_system TINYINT(1) NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Таблица пользователей
    CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        name VARCHAR(255) NOT NULL DEFAULT '',
        avatar VARCHAR(500) NULL,
        email_verified TINYINT(1) NOT NULL DEFAULT 0,
        specialization VARCHAR(100) NULL,
        is_young_specialist TINYINT(1) NOT NULL DEFAULT 0,
        is_first_employment TINYINT(1) NOT NULL DEFAULT 0,
        role_id INT UNSIGNED NULL,
        api_token VARCHAR(100) NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_role
            FOREIGN KEY (role_id) REFERENCES roles(id)
            ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Заполнение базовых системных ролей
    INSERT IGNORE INTO roles (name, is_system) VALUES 
    ('Гость', 1),
    ('Пользователь', 1),
    ('Редактор', 1),
    ('Модератор контента', 1),
    ('Администратор организации', 1),
    ('Суперадминистратор', 1);

    -- Добавляем тестовых пользователей (пароль 'password' -> хеш)
    ";
    
    $pdo->exec($sql);
    
    $hash = password_hash('password', PASSWORD_DEFAULT);

    $renameEmail = static function (PDO $pdo, string $from, string $to): void {
        $exists = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $exists->execute([$to]);

        if ($exists->fetch()) {
            return;
        }

        $update = $pdo->prepare('UPDATE users SET email = ? WHERE email = ?');
        $update->execute([$to, $from]);
    };

    $legacyDomain = 'profbaza.' . 'ru';
    $renameEmail($pdo, 'admin@' . $legacyDomain, 'admin@profbaza.by');
    $renameEmail($pdo, 'editor@' . $legacyDomain, 'editor@profbaza.by');
    
    // Вставляем админа
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (email, password_hash, name, role_id) SELECT 'admin@profbaza.by', ?, 'Соколова Мария Викторовна', id FROM roles WHERE name='Суперадминистратор'");
    $stmt->execute([$hash]);

    $stmt = $pdo->prepare("INSERT IGNORE INTO users (email, password_hash, name, specialization, role_id) SELECT 'editor@profbaza.by', ?, 'Никитин Артем Павлович', 'Педагогика', id FROM roles WHERE name='Редактор'");
    $stmt->execute([$hash]);

    echo "Schema created successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
