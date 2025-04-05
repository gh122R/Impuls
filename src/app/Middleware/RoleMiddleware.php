<?php

namespace App\Middleware;


use App\Models\User;

class RoleMiddleware
{
    private array $receivedRoles;
    public function __construct(string | array $roles)
    {
        if (is_string($roles)) {
            $roles = preg_split('/\s*\|\|\s*/', $roles);
        }
        $this->receivedRoles = $roles ;
    }

    public function handle(callable $next)
    {
        $user = new User();
        $role = $user->getRole($_SESSION['user_id']);
        $authMiddleware = new AuthMiddleware();
        $authMiddleware->handle(function() use ($next, $role) {
            if (!in_array($role, $this->receivedRoles)) {
                header('Location: /');
                exit;
            }
            return $next();
        });
    }
}