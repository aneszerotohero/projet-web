<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies as Middleware;

class EncryptCookies extends Middleware
{
    /**
     * The names of the cookies that should not be encrypted.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Ensure the XSRF cookie is not encrypted so front-end libraries
        // (axios / Inertia) can read it and send it as X-XSRF-TOKEN header.
        'XSRF-TOKEN',
    ];
}
