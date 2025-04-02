<?php

session_start();
require_once '../vendor/autoload.php';

use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Router;
$router = new Router();

$router->register('/', [App\Controllers\HomeController::class, 'create'], [AuthMiddleware::class])
       ->register('/login', [App\Controllers\Auth\AuthController::class, 'login'])
       /*->register('/google-auth', [App\Controllers\Auth\AuthController::class, 'googleAuth'])*/
       ->register('/register', [App\Controllers\Auth\AuthController::class, 'register'])
       ->register('/logout', [App\Controllers\Auth\AuthController::class, 'logout'],  [AuthMiddleware::class])
       ->register('/getUserComplaints', [App\Controllers\HomeController::class, 'getComplaints'],  [AuthMiddleware::class])
       ->register('/deleteComplaint', [App\Controllers\HomeController::class, 'deleteComplaint'],  [AuthMiddleware::class])
       ->register('/getUserCompletedComplaints', [App\Controllers\HomeController::class, 'getCompletedComplaints'],  [AuthMiddleware::class])
       ->register('/admin-panel', [App\Controllers\AdminController::class, 'index'],  [AuthMiddleware::class, [RoleMiddleware::class, 'admin']])
       ->register('/dashboard', [App\Controllers\DashboardController::class, 'index'],  [AuthMiddleware::class, [RoleMiddleware::class, 'admin']])
       ->register('/getAllComplaints', [App\Controllers\DashboardController::class, 'getComplaints'],  [AuthMiddleware::class, [RoleMiddleware::class, 'admin']])
       ->register('/getAllProcessingComplaints', [App\Controllers\AdminController::class, 'getAllProcessingComplaints'],  [AuthMiddleware::class, [RoleMiddleware::class, 'admin']])
       ->register('/getAdminComplaintsInWork', [App\Controllers\AdminController::class, 'getComplaintsInWork'],  [AuthMiddleware::class, [RoleMiddleware::class, 'admin']])
       ->register('/getAdminCompletedComplaints', [App\Controllers\AdminController::class, 'getCompletedComplaints'],  [AuthMiddleware::class, [RoleMiddleware::class, 'admin']])
       ->register('/takeComplaint', [App\Controllers\AdminController::class, 'takeComplaint'],  [AuthMiddleware::class, [RoleMiddleware::class, 'admin']])
       ->register('/completeComplaint', [App\Controllers\AdminController::class, 'completeComplaint'],  [AuthMiddleware::class, [RoleMiddleware::class, 'admin']])
       ->register('/hiddenAdminCompletedComplaint', [App\Controllers\AdminController::class, 'hideCompletedComplaint'],  [AuthMiddleware::class, [RoleMiddleware::class, 'admin']]);

echo $router->resolve($_SERVER['REQUEST_URI']);
