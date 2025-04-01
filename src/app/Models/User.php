<?php

namespace App\Models;
use PDO;
use PDOException;
use Dotenv\Dotenv;
use stdClass;

class User
{
    private Dotenv $dotenv;
    private PDO $db;
    public function __construct(){
        $this->dotenv = Dotenv::createImmutable(dirname(__DIR__, 3));
        $this->dotenv->load();
        $this->db = new PDO(
            'mysql:host=' . $_ENV['db_host'] . ';dbname=' . $_ENV['db_name'],
            $_ENV['db_user'], $_ENV['db_pass'],
            [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
    }
    public function findUser(string $email)
    {
        $stmt = $this->db->prepare("SELECT users.*, roles.role as role 
                                    FROM users 
                                    LEFT JOIN roles ON users.role_id = roles.id 
                                    WHERE users.email = :email");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    }

    public function findUserById(int $id): ?array
    {
        $stmt = $this->db->prepare("
                                    SELECT 
                                    users.id, 
                                    users.username, 
                                    users.first_name,
                                    users.surname,
                                    users.email, 
                                    users.role_id, 
                                    roles.role as role 
                                    FROM users 
                                    LEFT JOIN roles ON users.role_id = roles.id 
                                    WHERE users.id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
    public function setRole(int $userId, int $roleId): bool
    {
        try {
            $stmt = $this->db->prepare("UPDATE users SET role_id = :role_id WHERE id = :user_id");
            return $stmt->execute([
                'role_id' => $roleId,
                'user_id' => $userId,
            ]);
        } catch (PDOException $e) {
            return false;
        }
    }
    public function createUser(string $username, string $firstName, string $surname, string $email, string $user_password)
    {
        $passwordHash = password_hash($user_password, PASSWORD_DEFAULT);
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare(
                "INSERT INTO users (username, first_name, surname, email, user_password, is_active, created_at, rating, role_id)
                VALUES (:username, :first_name, :surname, :email, :user_password, 1, NOW(), 0, 1)"
            );
            $stmt->execute([
                'username' => $username,
                'first_name' => $firstName,
                'surname' => $surname,
                'email' => $email,
                'user_password' => $passwordHash,
            ]);
            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            return false;
        }
    }

    public function getRole(int $userId): ?string
    {
        $stmt = $this->db->prepare("SELECT r.role FROM roles r 
                                    JOIN users u ON u.role_id = r.id
                                    WHERE u.id = :user_id");
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchColumn() ?: null;
    }
}
