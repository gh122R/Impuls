<?php

namespace App\Controllers;

use App\Models\Complaint;
use App\Models\User;
use App\View\View;

class ModeratorController
{
    private $Complaint;
    private $User;
    public function __construct()
    {
        $this->Complaint = new Complaint();
        $this->User = new User();
    }
    public function index()
    {
        $data = [
            'pageTitle' => 'Управление',
        ];
        return View::render('/moderator-panel/index', $data);
    }

    public function getAllComplaints()
    {
        $complaints = $this->Complaint->getAllComplaints() ?? null;
        echo json_encode(['complaints' => $complaints]);
        exit();
    }

    public function getAllUsers()
    {
        $users = $this->User->getAllUsers() ?? null;
        echo json_encode(['users' => $users]);
        exit();
    }

    public function deleteUser()
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
    }

    public function setRole()
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = $data['userId'];
            $role = $data['role'];
            if($userId)
            {
                $this->User->setRole($userId, $role);
                echo json_encode(['success' => true]);
                exit();
            }
            echo json_encode(['success' => false]);
            exit();
        }
    }
}