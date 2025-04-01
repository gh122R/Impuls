<?php

namespace App\Controllers;

use App\Models\Complaint;
use App\View\View;

class DashboardController
{
    private $Complaint;
    public function __construct()
    {
        $this->Complaint = new Complaint();
    }
    public function index()
    {
        $data = [
            'pageTitle' => 'Дашборд',
        ];
        return View::render('/dashboard/index', $data);
    }

    public function getComplaints()
    {
        $complaints = $this->Complaint->getAllComplaints() ?? null;
        echo json_encode(['complaints' => $complaints]);
        exit();
    }
}