<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | The React frontend (vitmart-react) lives on a different origin than
    | this Laravel app, so browsers require CORS headers on every /api/*
    | response. Regular customer auth is via Sanctum bearer tokens (no
    | cookies needed), but the Admin Login page authenticates through the
    | existing session-based /login route, which needs the session/XSRF
    | cookies to travel cross-origin — hence 'login' and the csrf-cookie
    | route are included below with credentials support enabled.
    |
    */

    'paths' => ['api/*', 'login', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
