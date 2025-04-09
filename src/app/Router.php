<?php

namespace App;

/*use App\Controllers\ModeratorController;
use App\Exceptions\RouteNotFoundException;*/
use App\View\View;

class Router
{
    private array $routes;
    public function register(string $route, callable|array $action, array $middleware = []): self
    {
        $this->routes[$route] = [
            'action' => $action,
            'middleware' => $middleware,
        ];
        return $this;
    }

    public function resolve(string $uri)
    {
        $route = explode('?', $uri)[0];
        $routeData = $this->routes[$route] ?? null;
        if (!$routeData) {
            return View::render('/404', ['route' => $route]);
        }
        $action = $routeData['action'];
        $middlewareList = $routeData['middleware'];
        $response = null;
        $next = function () use ($action, &$response)
        {
            if (is_callable($action))
            {
                $response = call_user_func($action);
            } elseif (is_array($action)) {
                [$class, $method] = $action;
                if (class_exists($class)) {
                    $classInstance = new $class();
                    if (method_exists($classInstance, $method)) {
                        $response = call_user_func_array([$classInstance, $method], []);
                    } else {
                        throw new \Exception("$method не найден в $class");
                    }
                } else {
                    throw new \Exception("$class не найден");
                }
            }
        };
        foreach (array_reverse($middlewareList) as $middleware)
        {
            if (is_array($middleware)) {
                [$middlewareClass, $param] = $middleware;
                if (class_exists($middlewareClass)) {
                    $middlewareInstance = new $middlewareClass($param);
                    if (method_exists($middlewareInstance, 'handle')) {
                        $next = function () use ($middlewareInstance, $next) {
                            return $middlewareInstance->handle($next);
                        };
                    } else {
                        throw new \Exception("handle не найден в $middlewareClass");
                    }
                } else {
                    throw new \Exception("$middlewareClass не найден");
                }
            } else {
                if (class_exists($middleware)) {
                    $middlewareInstance = new $middleware();
                    if (method_exists($middlewareInstance, 'handle')) {
                        $next = function () use ($middlewareInstance, $next) {
                            return $middlewareInstance->handle($next);
                        };
                    } else {
                        throw new \Exception("handle не найден в $middleware");
                    }
                } else {
                    throw new \Exception("$middleware не найден");
                }
            }
        }
        $next();
        return $response;
    }
}
