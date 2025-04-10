<?php

namespace App\Controllers;
use App\Models\Complaint;
use App\Models\User;
use App\View\View;

class HomeController
{
    private $Complaint;
    private $User;
    public function __construct()
    {
        $this->Complaint = new Complaint();
        $this->User = new User();
    }
    public function create():string
    {
        $departments = $this->Complaint->getDepartments();
        $problemCategories = $this->Complaint->getProblemCategories();
        $userInfo = $this->User->findUserById($_SESSION['user_id']);
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $description = htmlspecialchars($_POST['description']) ?? '';
            $departmentId = $_POST['departmentId'] ?? null;
            $problemCategoryId = $_POST['problemCategoryId'] ?? null;
            if (!empty($description) && !empty($departmentId) && !empty($problemCategoryId)) {
                $result = $this->Complaint->createComplaint($description, $departmentId, $problemCategoryId);
                if ($result) {
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false]);
                }
            }
            exit;
        }
        $data = [
            'pageTitle' => 'Домашняя страница',
            'header' => 'Импульс',
            'departments' => $departments,
            'problemCategories' => $problemCategories,
            'userInfo' => $userInfo
        ];
        return View::render('/home/index', $data);
    }

    public function getComplaints()
    {
        $userComplaints = $this->Complaint->getUserComplaints($_SESSION['user_id']) ?? null;
        echo json_encode(['complaints' => $userComplaints]);
        exit();
    }

    public function getCompletedComplaints()
    {
        $userCompletedComplaints = $this->Complaint->getUserCompletedComplaints($_SESSION['user_id']) ?? null;
        echo json_encode(['completedComplaints' => $userCompletedComplaints]);
        exit();
    }

    public function deleteComplaint()
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents("php://input"),true);
            $complaintId = $data['complaintId'];
            $userId = $_SESSION['user_id'];
            if($complaintId)
            {
                $result = $this->Complaint->deleteComplaint($complaintId, $userId);
                echo json_encode(['success' => $result,'id' => $complaintId]);
                exit();
            }
            echo json_encode(['success' => false, 'id' => $complaintId]);
            exit();
        }
    }
}