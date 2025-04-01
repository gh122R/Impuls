<?php

namespace App\View;

class View
{
    public static function render(string $viewPath, array $data = [])
    {
        extract($data);
        ob_start();
        include __DIR__ . '/../../views/' . $viewPath . '.html';
        return ob_get_clean();
    }
}