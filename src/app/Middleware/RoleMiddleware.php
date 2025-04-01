<?php

namespace App\Middleware;


use App\Models\User;

class RoleMiddleware
{
    private $role;
    public function __construct($role)
    {
        $this->role = $role ;
    }

    public function handle(callable $next)
    {
        $user = new User();
        $role = $user->getRole($_SESSION['user_id']);
        $authMiddleware = new AuthMiddleware();
        $authMiddleware->handle(function() use ($next, $role) {
            if ($role !== $this->role) {
                header('Location: /');
                exit;
            }
            return $next();
        });
    }
}