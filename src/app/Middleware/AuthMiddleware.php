<?php

namespace App\Middleware;
use App\Models\User;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Dotenv\Dotenv;

class AuthMiddleware
{
    private $dotenv;
    private $jwtKey;
    public function __construct()
    {
        $this->dotenv = Dotenv::createImmutable(dirname(__DIR__,3));
        $this->dotenv->load();
        $this->jwtKey = $_ENV['jwtKey'];
    }

    private function destroySession(): void
    {
        $_SESSION = [];
        session_destroy();
        setcookie('token', '', time() - 3600, '/');
        unset($_COOKIE['token']);
        header('Location: /login');
        exit;
    }

    public function handle(callable $next){
        $jwt = $_COOKIE['token'] ?? null;
        if (!$jwt) {
            header('Location: /login');
            exit;
        }
        try {
            $key = new Key($this->jwtKey, 'HS256');
            $decoded = JWT::decode($jwt, $key);
            $_SESSION['user_id'] = $decoded->user_id;
        }catch (\UnexpectedValueException $e)
        {
            $this->destroySession();
        }
        try {
            $key = new Key($this->jwtKey, 'HS256');
            $decoded = JWT::decode($jwt, $key);
            $_SESSION['user_id'] = $decoded->user_id;
            $_SESSION['username'] = $decoded->username;
            $user = new User();
            if (!$user -> findUserById($_SESSION['user_id']))
            {
                $this->destroySession();
            }
        }catch (ExpiredException $e){
            header('Location: /login');
            exit;
        }
        return $next();
    }
}