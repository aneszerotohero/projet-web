<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Projetschool') }}</title>
    <link rel="icon" type="image/png" href="{{ asset('graduated.png') }}?v=1.0">

    @if (class_exists(\Inertia\Inertia::class))
        @inertiaHead
    @endif

    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

</head>
<body>
    @if (class_exists(\Inertia\Inertia::class))
        @inertia
    @else
        @yield('content')
    @endif
</body>
</html>
