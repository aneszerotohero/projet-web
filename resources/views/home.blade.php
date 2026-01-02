@extends('app')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-sky-50">
    <div class="text-center p-8">
        <h1 class="text-4xl font-bold mb-4">Bienvenue sur Projetschool</h1>
        <p class="mb-6 text-gray-600">Consultez vos notes, absences et le classement.</p>
        <a href="/login" class="inline-block px-6 py-3 bg-sky-600 text-white rounded-md">Se connecter</a>
    </div>
</div>
@endsection