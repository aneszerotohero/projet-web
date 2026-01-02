@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Mes absences</h1>

    @if($absences->isEmpty())
        <p>Aucune absence trouvée.</p>
    @else
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Module</th>
                    <th>Motif</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                @foreach($absences as $absence)
                    <tr @if($absence->trashed()) class="table-light" @endif>
                        <td>{{ $absence->date_absence->format('Y-m-d') }}</td>
                        <td>{{ $absence->module->libelle ?? '—' }}</td>
                        <td>{{ $absence->motif_absence }}</td>
                        <td>
                            @if($absence->trashed())
                                <span class="badge bg-danger">Supprimée</span>
                                @if($absence->motif_suppression)
                                    <div><small>Motif suppression: {{ $absence->motif_suppression }}</small></div>
                                @endif
                            @else
                                <span class="badge bg-success">Valide</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
</div>
@endsection
