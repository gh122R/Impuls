<?php

declare(strict_types=1);
namespace App\Controllers;

use App\Models\Complaint;
use App\Models\User;
use App\View\View;

class AdminController
{
    private object $Complaint;
    private object $User;

    public function __construct()
    {
        $this->Complaint = new Complaint();
        $this->User = new User();
    }

    public function index(): string
    {
        $userInfo = $this->User->findUserById($_SESSION['user_id']);
        $data = [
            'pageTitle' => 'админ-панель',
            'userInfo' => $userInfo
        ];
        return View::render('admin-panel/index', $data);
    }

    public function getAllProcessingComplaints(): never
    {
        $complaints = $this->Complaint->getAllProcessingComplaints();
        echo json_encode([
            'complaints' => $complaints
        ]);
        exit();
    }

    public function getComplaintsInWork(): never
    {
        $complaints = $this->Complaint->getAdminComplaintsInWork($_SESSION['user_id']);
        echo json_encode([
            'complaints' => $complaints
        ]);
        exit();
    }

    public function getCompletedComplaints(): never
    {
        $complaints = $this->Complaint->getAdminCompletedComplaints($_SESSION['user_id']);
        echo json_encode([
            'complaints' => $complaints
        ]);
        exit();
    }

    public function takeComplaint(): never
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents("php://input"),true);
            $complaintId = (int)$data['complaintId'];
            $adminId = $_SESSION['user_id'];

            if($complaintId && $adminId)
            {
                $result = $this->Complaint->takeComplaint($complaintId, $adminId);
                echo json_encode(['success' => $result]);
                exit();
            }
        }
        echo json_encode(['success' => false]);
        exit();
    }

    public function completeComplaint(): never
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents("php://input"),true);
            $complaintId = $data['complaintId'];
            $comment = $data['comment'];
            if($complaintId)
            {
                $result = $this->Complaint->adminCompleteComplaint($complaintId, $comment);
                echo json_encode(['success' => $result]);
                exit();
            }
            echo json_encode(['success' => false]);
            exit();
        }
        exit();
    }

    public function hideCompletedComplaint(): never
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents("php://input"),true);
            $complaintId = (int)$data['complaintId'];
            if($complaintId)
            {
                $result = $this->Complaint->adminRemoveCompletedComplaint($complaintId);
                echo json_encode(['success' => $result, 'id' => $complaintId] );
                exit();
            }
            echo json_encode(['success' => false]);
            exit();
        }
        exit();
    }
}