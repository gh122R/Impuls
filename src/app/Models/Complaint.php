<?php

declare(strict_types=1);
namespace App\Models;

use PDO;
use PDOException;
use Dotenv\Dotenv;
class Complaint
{
    private Dotenv $dotenv;
    private PDO $db;
    public function __construct()
    {
        $this->dotenv = Dotenv::createImmutable(dirname(__DIR__, 3));
        $this->dotenv->load();
        $this->db = new PDO('mysql:host=' . $_ENV['db_host'] . '; dbname=' . $_ENV['db_name'] ,
            $_ENV['db_user'], $_ENV['db_pass'], [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    }

    public function getDepartments(): array
    {
        try
        {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("SELECT * FROM departments");
            $stmt->execute();
            $this->db->commit();
            return $stmt->fetchAll();
        }catch (PDOException)
        {
            $this->db->rollBack();
            return [];
        }
    }

    public function getProblemCategories(): array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM problem_categories");
            $stmt->execute();
             return $stmt->fetchAll();
        }catch (PDOException){
            return [];
        }
    }

    public function createComplaint(string $description, int $departmentId, int $problemCategoryId): bool
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("INSERT INTO complaints (description, department_id, problem_category_id,status,created_at,user_id) 
                                                VALUES (:description, :department_id, :problem_category_id, 'В обработке' ,NOW(), :user_id)");
            $stmt->execute([
                "description" => $description,
                "department_id" => $departmentId,
                "problem_category_id" => $problemCategoryId,
                "user_id" => $_SESSION["user_id"]
            ]);
            $this->db->commit();
            return true;
        }catch (PDOException){
            $this->db->rollBack();
            return false;
        }
    }
    public function getUserComplaints(int $userId): array
    {
        try {
            $stmt = $this->db->prepare("
                        SELECT 
                            c.id, 
                            c.description, 
                            c.status, 
                            c.created_at, 
                            c.updated_at, 
                            c.user_id, 
                            c.admin_id, 
                            c.admin_comment, 
                            c.user_rating, 
                            d.department AS department, 
                            p.problem AS problem_category
                        FROM 
                            complaints c
                        JOIN 
                            departments d ON c.department_id = d.id
                        JOIN 
                            problem_categories p ON c.problem_category_id = p.id
                        WHERE 
                            c.user_id = :user_id;
                        ");
            $stmt->execute(["user_id" => $userId]);
            return $stmt->fetchAll();
        }catch (PDOException)
        {
            return [];
        }
    }

    public function getUserCompletedComplaints(int $userId): array
    {
        try {
            $stmt = $this->db->prepare("
                         SELECT 
                            c.id, 
                            c.description, 
                            c.status, 
                            c.created_at, 
                            c.updated_at, 
                            c.user_id, 
                            c.admin_id, 
                            c.admin_comment, 
                            c.user_rating, 
                            d.department AS department, 
                            p.problem AS problem_category
                        FROM 
                            complaints c
                        JOIN 
                            departments d ON c.department_id = d.id
                        JOIN 
                            problem_categories p ON c.problem_category_id = p.id
                        WHERE 
                            c.user_id = :user_id AND c.status = 'Выполнено'; ");
            $stmt->execute([
                "user_id" => $userId
            ]);
            return $stmt->fetchAll();
        }catch (PDOException)
        {
            return [];
        }
    }

    public function getAllComplaints(): array
    {
        try {
            $stmt = $this->db->prepare("
                  SELECT 
                        c.id,
                        c.description,
                        d.department AS department, 
                        pc.problem AS problem_category, 
                        u.username AS username, 
                        u.first_name AS first_name,
                        u.surname AS surname,
                        c.status,
                        c.created_at,
                        IFNULL(a.username, 'Не назначен') AS admin_name, 
                        c.admin_comment,
                        c.user_rating
                    FROM complaints c
                    JOIN users u ON c.user_id = u.id
                    JOIN departments d ON c.department_id = d.id
                    JOIN problem_categories pc ON c.problem_category_id = pc.id
                    LEFT JOIN users a ON c.admin_id = a.id
                    ORDER BY c.created_at DESC;
        ");
            $stmt->execute();
             return $stmt->fetchAll();
        }catch (PDOException)
        {
            return [];
        }
    }

    public function getAllProcessingComplaints(): array
    {
        try {
            $stmt = $this->db->prepare("
                  SELECT 
                        c.id,
                        c.description,
                        d.department AS department, 
                        pc.problem AS problem_category, 
                        u.username AS username, 
                        u.first_name AS first_name,
                        u.surname AS surname,
                        c.status,
                        c.created_at AS created_at,
                        IFNULL(a.username, 'Не назначен') AS admin_name, 
                        c.admin_comment,
                        c.user_rating
                    FROM complaints c
                    JOIN users u ON c.user_id = u.id
                    JOIN departments d ON c.department_id = d.id
                    JOIN problem_categories pc ON c.problem_category_id = pc.id
                    LEFT JOIN users a ON c.admin_id = a.id
                    WHERE c.status = 'В обработке'
                    ORDER BY c.created_at DESC;
        ");
            $stmt->execute();
            return $stmt->fetchAll();
        }catch (PDOException)
        {
            return [];
        }
    }

    public function takeComplaint(int $complaintId, int $adminId): bool
    {
        try {
            $this->db->beginTransaction();
            $checkStmt = $this->db->prepare("SELECT admin_id FROM complaints WHERE id = :complaint_id AND admin_id IS NULL;");
            $checkStmt->execute(["complaint_id" => $complaintId]);
            if ($checkStmt->rowCount() === 0) {
                $this->db->rollBack();
                return false;
            }

            $stmt = $this->db->prepare("
                    UPDATE complaints
                    SET admin_id = :admin_id,
                        status = 'В работе'
                    WHERE id = :complaint_id;
            ");
            $stmt->execute([
                "admin_id" => $adminId,
                "complaint_id" => $complaintId
            ]);
            $this->db->commit();
            return true;
        }catch (PDOException)
        {
            $this->db->rollBack();
            return false;
        }
    }

    public function getAdminComplaintsInWork(int $adminId): array
    {
        try
        {
            $stmt = $this->db->prepare("
                    SELECT 
                        c.id,
                        c.description,
                        d.department AS department, 
                        pc.problem AS problem_category, 
                        u.username AS username, 
                        u.first_name AS first_name,
                        u.surname AS surname,
                        c.status,
                        c.created_at,
                        c.updated_at AS updated_at,
                        c.admin_comment,
                        c.user_rating
                    FROM complaints c
                    JOIN users u ON c.user_id = u.id
                    JOIN departments d ON c.department_id = d.id
                    JOIN problem_categories pc ON c.problem_category_id = pc.id
                    LEFT JOIN users a ON c.admin_id = a.id
                    WHERE c.admin_id = :admin_id AND c.status = 'В работе'
                    ORDER BY c.created_at DESC;");
            $stmt->execute([
                'admin_id' => $adminId
                ]);
            return $stmt->fetchAll();
        }catch (PDOException)
        {
            return [];
        }
    }

    public function getAdminCompletedComplaints(int $adminId): array
    {
        try {
            $stmt = $this->db->prepare("
                  SELECT 
                        c.id,
                        c.description,
                        d.department AS department, 
                        pc.problem AS problem_category, 
                        u.username AS username, 
                        u.first_name AS first_name,
                        u.surname AS surname,
                        c.status,
                        c.created_at AS created_at,
                         c.updated_at AS updated_at,
                        c.admin_comment,
                        c.user_rating
                    FROM complaints c
                    JOIN users u ON c.user_id = u.id
                    JOIN departments d ON c.department_id = d.id
                    JOIN problem_categories pc ON c.problem_category_id = pc.id
                    LEFT JOIN users a ON c.admin_id = a.id
                    WHERE c.status = 'Выполнено' AND c.admin_id = :admin_id AND c.admin_remove = 0
                    ORDER BY c.created_at DESC;
        ");
            $stmt->execute([
                'admin_id' => $adminId
            ]);
            return $stmt->fetchAll();
        }catch(PDOException)
        {
            return [];
        }
    }

    public function adminCompleteComplaint(int $complaintId, string | null $comment): bool
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("UPDATE complaints 
                    SET status = 'Выполнено',
                        admin_comment = :comment 
                    WHERE id = :complaint_id;");
             $stmt->execute([
                 "complaint_id" => $complaintId,
                 "comment" => $comment
             ]);
             $this->db->commit();
             return true;
        }catch (PDOException){
            $this->db->rollBack();
            return false;
        }
    }

    public function adminRemoveCompletedComplaint(int $complaintId): bool
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("UPDATE complaints 
                                    SET admin_remove = true
                                    WHERE id = :complaint_id;");
            $stmt->execute([
                'complaint_id' => $complaintId
            ]);
            $this->db->commit();
            return true;
        }catch (PDOException){
            $this->db->rollBack();
            return false;
        }
    }

    public function deleteComplaint(int $complaintId, int $userId): bool
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("DELETE FROM complaints WHERE id = :complaint_id AND user_id = :user_id;");
            $stmt->execute([
                'complaint_id' => $complaintId,
                'user_id' => $userId
            ]);
            $this->db->commit();
            return true;
        }catch (PDOException){
            $this->db->rollBack();
            return false;
        }
    }
}