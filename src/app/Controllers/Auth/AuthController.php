<?php

declare(strict_types=1);
namespace App\Controllers\Auth;

use App\Models\User;
use App\View\View;
use Dotenv\Dotenv;
use Firebase\JWT\JWT;

class AuthController
{
    private string $jwtKey;
    private Dotenv $dotenv;

    public function __construct()
    {
        $this->dotenv = Dotenv::createImmutable(dirname(__DIR__, 4));
        $this->dotenv->load();
        $this->jwtKey = $_ENV['jwtKey'];
    }

    private function setAuthCookie($user): never
    {
        $issuedAt = time();
        $expirationTime = $issuedAt + 3600*60*60*24*30;
        $payload = [
            'iss' => 'http://localhost',
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'user_id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ];
        $jwt = JWT::encode($payload, $this->jwtKey, 'HS256');
        setcookie('token', $jwt, time() + 3600*24*30, '/');
        header('Location: /');
        exit;
    }

    public function login(): string
    {
        $error = 'Неверные учётные данные!';
        $data = [
          'pageTitle' => 'Авторизация',
            'header' => 'Импульс | Авторизация'
        ];

        if ($_SERVER['REQUEST_METHOD'] === 'POST')
        {
            $email = htmlspecialchars($_POST['email']) ?? '';
            $password = htmlspecialchars($_POST['password']) ?? '';
            $userModel = new User();
            $user = $userModel->findUserByEmail($email);
            if (!$user)
            {
                return view::render('auth/login', ['error' => $error, 'pageTitle' => $data['pageTitle'], 'header' => $data['header']]);
            }else if(password_verify($password, $user['user_password']))
            {
                $this->setAuthCookie($user);
            }else
            {
                return view::render('auth/login', ['error' => $error, 'pageTitle' => $data['pageTitle'], 'header' => $data['header']]);
            }
        }
        return view::render('auth/login', $data);
    }

/*    public function googleAuth() : string
    {
        header('Content-Type: application/json');
        $inputData = json_decode(file_get_contents("php://input"), true);
        $googleToken = $inputData['token'] ?? null;
        if (!$googleToken)
        {
            echo json_encode(['success' => false]);
            exit;
        }
        $client = new \Google_Client(['client_id' => '']);
        $clientResponse = $client->verifyIdToken($googleToken);
        if (!$clientResponse)
        {
            echo json_encode(['success' => false]);
            exit;
        }
        if ($clientResponse) {
            $email = $clientResponse['email'];
            $userModel = new User();
            $user = $userModel->findUserByEmail($email);
            if(!$user){
                $username = explode('@', $email)[0];
                $userPass = bin2hex(random_bytes(16));
                $userModel ->createUser($username, $clientResponse['given_name'], $clientResponse['family_name'],
                    $clientResponse['email'], $userPass );
                $user = $userModel->findUserByEmail($email);
            }
        }
        $role = $userModel->getRole($user['id']);
        $payload = [
            'iss' => 'http://localhost',
            'iat' => time(),
            'exp' => time() + 3600 * 24 * 30,
            'user_id' => $user['id'],
            'username' => $user['username'],
            'role' => $role
        ];
        $jwt = JWT::encode($payload, $this->jwtKey, 'HS256');
        setcookie('token', $jwt, time() + 3600 * 24 * 30, '/');
        return json_encode(['success' => true]);
    }*/

    public function register(): string
    {
        $error = 'Ошибка регистрации ;(';
        $data = [
            'pageTitle' => 'Регистрация',
            'header' => 'Импульс | Регистрация'
        ];
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = htmlspecialchars($_POST['username']) ?? '';
            $email = htmlspecialchars($_POST['email']) ?? '';
            $password = htmlspecialchars($_POST['password']) ?? '';
            $firstName = htmlspecialchars($_POST['first_name']) ?? '';
            $surname = htmlspecialchars($_POST['surname']) ?? '';
            $userModel = new User();
            if ($userModel->createUser($username, $firstName, $surname, $email, $password))
            {
                $user = $userModel->findUserByEmail($email);
                $this->setAuthCookie($user);

            }else{
                return view::render('auth/register', ['error' => $error, 'pageTitle' => $data['pageTitle'], 'header' => $data['header']]);
            }
        }
        return view::render('auth/register', $data);
    }

    public function logout(): never
    {
        $_SESSION = [];
        session_destroy();
        setcookie('token', '', time() - 3600, '/');
        header('Location: /login');
        exit;
    }
}