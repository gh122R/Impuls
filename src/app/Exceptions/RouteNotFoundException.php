<?php

namespace App\Exceptions;

class RouteNotFoundException extends \Exception
{
    protected $message = 'Route not found';
}