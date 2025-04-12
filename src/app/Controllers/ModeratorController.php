<?php

declare(strict_types=1);
namespace App\Controllers;

use App\Models\Complaint;
use App\Models\User;
use App\View\View;

class ModeratorController
{
    private object $Complaint;
    private object $User;

    public function __construct()
    {
        $this->Complaint = new Complaint();
        $this->User = new User();
    }

    public function index(): string
    {   $userInfo = $this->User->findUserById($_SESSION['user_id']);
        $data = [
            'pageTitle' => 'Управление',
            'userInfo' => $userInfo,

        ];
        return View::render('/moderator-panel/index', $data);
    }

    public function getAllComplaints(): never
    {
        $complaints = $this->Complaint->getAllComplaints() ?? null;
        echo json_encode(['complaints' => $complaints]);
        exit();
    }

    public function getRoles(): never
    {
        $roles = $this->User->getRoles() ?? null;
        echo json_encode(['roles' => $roles]);
        exit();
    }

    public function getAllUsers(): never
    {
        $users = $this->User->getAllUsers() ?? null;
        echo json_encode(['users' => $users]);
        exit();
    }

    public function deleteUser(): never
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = $data['userId'];
            $role = $this->User->getRole($_SESSION['user_id']);
            if($userId)
            {
                $this->User->deleteUser($userId, $role, $data['password']);
                echo json_encode(['success' => true]);
                exit();
            }
            echo json_encode(['success' => false, 'id' => $userId]);
            exit();
        }
        exit();
    }

    public function setRole(): never
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = (int)$data['userId'];
            $role = (int)$data['role'];
            if($userId)
            {
                $this->User->setRole($userId, $role);
                echo json_encode(['success' => true]);
                exit();
            }
            echo json_encode(['success' => false]);
            exit();
        }
        exit();
    }
}