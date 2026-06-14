<?php
require_once __DIR__ . '/config.php';

$route = $_GET['route'] ?? '';

$routes = [
    'auth/register' => __DIR__ . '/auth/register.php',
    'auth/login'    => __DIR__ . '/auth/login.php',
    'shopping'      => __DIR__ . '/shopping.php',
    'budget'        => __DIR__ . '/budget.php',
    'recipes'       => __DIR__ . '/recipes.php',
    'planners/weekly'  => __DIR__ . '/planners/weekly.php',
    'planners/monthly' => __DIR__ . '/planners/monthly.php',
    'planners/yearly'  => __DIR__ . '/planners/yearly.php',
];

if (isset($routes[$route])) {
    require $routes[$route];
} else {
    jsonResponse(['message' => 'Smart Life API v1.0', 'endpoints' => array_keys($routes)]);
}
