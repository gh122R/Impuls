<?php

namespace App\Middleware;
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
            $_SESSION['username'] = $decoded->username;
        }catch (ExpiredException $e){
            header('Location: /login');
            exit;
        }
        return $next();
    }
}