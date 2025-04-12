<?php

declare(strict_types=1);
namespace App\Models;

use PDO;
use PDOException;
use Dotenv\Dotenv;

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

    public function getRoles(): array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM roles");
            $stmt->execute();
            return $stmt->fetchAll();
        }catch (PDOException){
            return [];
        }
    }

    public function getAllUsers(): array
    {
        try {
            $stmt = $this->db->prepare("SELECT
                                    users.id, 
                                    users.username, 
                                    users.first_name,
                                    users.surname,
                                    users.email, 
                                    users.role_id,
                                    roles.role 
                                    FROM users
                                    LEFT JOIN roles ON users.role_id = roles.id");
            $stmt->execute();
            return $stmt->fetchAll();
        }catch (PDOException)
        {
            return [];
        }
    }

    public function findUserByEmail(string $email)
    {
        try
        {
            $stmt = $this->db->prepare("SELECT users.*, roles.role as role 
                                    FROM users 
                                    LEFT JOIN roles ON users.role_id = roles.id 
                                    WHERE users.email = :email");
            $stmt->execute(['email' => $email]);
            return $stmt->fetch();
        }catch (PDOException)
        {
            return [];
        }
    }

    public function findUserById(int $id): mixed
    {
        try
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
        }catch (PDOException)
        {
            return [];
        }
    }

    public function createUser(string $username, string $firstName, string $surname, string $email, string $user_password): bool
    {
        $passwordHash = password_hash($user_password, PASSWORD_DEFAULT);
        try
        {
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
        } catch (PDOException)
        {
            $this->db->rollBack();
            return false;
        }
    }

    public function deleteUser(int $userId, string $role, string $password): bool
    {
        try
        {
            $user = $this->findUserById($userId);
            if (!$user)
            {
                return false;
            }
            if ($role === 'moderator' || password_verify($password, $user['user_password']))
            {
                $this->db->beginTransaction();
                $stmt = $this->db->prepare("DELETE FROM users WHERE id = :user_id");
                $stmt->execute(['user_id' => $userId]);
                $this->db->commit();
                return true;
            }else
            {
                return false;
            }
        }catch (PDOException)
        {
            $this->db->rollBack();
            return false;
        }
    }

    public function setRole(int $userId, int $roleId): bool
    {
        try
        {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("UPDATE users SET role_id = :role_id WHERE id = :user_id");
            $stmt->execute([
                'role_id' => $roleId,
                'user_id' => $userId,
            ]);
            $this->db->commit();
            return true;
        } catch (PDOException) {
            $this->db->rollBack();
            return false;
        }
    }

    public function getRole(int $userId): string
    {
        try {
            $stmt = $this->db->prepare("SELECT r.role FROM roles r 
                                    JOIN users u ON u.role_id = r.id
                                    WHERE u.id = :user_id");
            $stmt->execute(['user_id' => $userId]);
            return $stmt->fetchColumn();
        }catch (PDOException)
        {
            return '';
        }
    }
}
