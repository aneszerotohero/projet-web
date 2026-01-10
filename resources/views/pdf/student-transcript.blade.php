<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relevé de Notes - {{ $student->prenom }} {{ $student->nom }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        @page {
            margin: 20mm;
        }
        body {
            font-family: 'DejaVu Sans', 'Helvetica', Arial, sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.5;
            padding: 0;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .header .subtitle {
            font-size: 14px;
            color: #64748b;
        }
        .student-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #2563eb;
        }
        .student-info table {
            width: 100%;
            border-collapse: collapse;
        }
        .student-info td {
            padding: 8px 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        .student-info td:first-child {
            font-weight: bold;
            width: 150px;
            color: #475569;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        .averages-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
            border-collapse: separate;
            border-spacing: 15px;
        }
        .averages-row {
            display: table-row;
        }
        .average-card {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #cbd5e1;
            display: table-cell;
            width: 33.33%;
            vertical-align: top;
        }
        .average-card .semester {
            font-size: 14px;
            font-weight: bold;
            color: #475569;
            margin-bottom: 5px;
        }
        .average-card .value {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
        }
        .notes-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            background: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .notes-table thead {
            background: #1e40af;
            color: #fff;
        }
        .notes-table th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .notes-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        .notes-table tbody tr:last-child td {
            border-bottom: none;
        }
        .grade-excellent {
            color: #059669;
            font-weight: bold;
        }
        .grade-good {
            color: #2563eb;
            font-weight: bold;
        }
        .grade-fail {
            color: #dc2626;
            font-weight: bold;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
        }
        .badge-pass {
            background: #d1fae5;
            color: #065f46;
        }
        .badge-fail {
            background: #fee2e2;
            color: #991b1b;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #64748b;
        }
        .summary-box {
            background: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #bfdbfe;
        }
        .summary-box .summary-item {
            display: table;
            width: 100%;
            padding: 8px 0;
            border-bottom: 1px solid #dbeafe;
        }
        .summary-box .summary-item span:first-child {
            display: table-cell;
            width: 50%;
        }
        .summary-box .summary-item span:last-child {
            display: table-cell;
            width: 50%;
            text-align: right;
            font-weight: bold;
        }
        .summary-box .summary-item:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 14px;
            color: #1e40af;
        }
        .no-data {
            text-align: center;
            padding: 40px;
            color: #94a3b8;
            font-style: italic;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>RELEVÉ DE NOTES</h1>
        <div class="subtitle">Document Officiel - Année Académique {{ date('Y') }}</div>
    </div>

    <!-- Student Information -->
    <div class="student-info">
        <table>
            <tr>
                <td>Nom complet:</td>
                <td>{{ $student->prenom }} {{ $student->nom }}</td>
            </tr>
            <tr>
                <td>Matricule:</td>
                <td>{{ $student->user?->matricule ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Option:</td>
                <td>{{ $student->option?->libelle ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Spécialité:</td>
                <td>{{ $student->option?->specialite?->libelle ?? 'N/A' }} (Année {{ $student->option?->specialite?->annee ?? 'N/A' }})</td>
            </tr>
            <tr>
                <td>Date d'émission:</td>
                <td>{{ date('d/m/Y à H:i') }}</td>
            </tr>
        </table>
    </div>

        <!-- Semester Averages -->
        @if(count($moyennes) > 0)
        <div class="section">
            <div class="section-title">Moyennes par Semestre</div>
            <table class="averages-grid" style="width: 100%; border-collapse: separate; border-spacing: 15px;">
                <tr>
                    @foreach($moyennes as $sem => $moy)
                    <td class="average-card" style="width: 33.33%;">
                        <div class="semester">Semestre {{ $sem }}</div>
                        <div class="value">{{ number_format($moy, 2) }}/20</div>
                        <div class="badge {{ $moy >= 10 ? 'badge-pass' : 'badge-fail' }}">
                            {{ $moy >= 10 ? 'Admis' : 'Ajourné' }}
                        </div>
                    </td>
                    @endforeach
                </tr>
            </table>
        </div>
        @endif

    <!-- Summary -->
    @php
        $totalNotes = $notes->count();
        $totalModules = $notes->groupBy('module_id')->count();
        $cycleAverage = count($moyennes) > 0 ? array_sum($moyennes) / count($moyennes) : 0;
        $filterLabel = $selected_semester && $selected_semester !== 'all' ? 'Semestre ' . $selected_semester : 'Tous les semestres';
    @endphp

    <div class="summary-box">
        <table style="width: 100%;">
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #dbeafe;">Période:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #dbeafe; text-align: right; font-weight: bold;">{{ $filterLabel }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #dbeafe;">Nombre de modules:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #dbeafe; text-align: right; font-weight: bold;">{{ $totalModules }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #dbeafe;">Nombre total de notes:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #dbeafe; text-align: right; font-weight: bold;">{{ $totalNotes }}</td>
            </tr>
            @if($selected_semester === 'all' || !$selected_semester)
            <tr>
                <td style="padding: 8px 0; font-weight: bold; font-size: 14px; color: #1e40af;">Moyenne de cycle:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 14px; color: #1e40af;">{{ number_format($cycleAverage, 2) }}/20</td>
            </tr>
            @endif
        </table>
    </div>

    <!-- Detailed Grades -->
    <div class="section">
        <div class="section-title">Détail des Notes - {{ $filterLabel }}</div>
        @if($notes->count() > 0)
            <table class="notes-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Module</th>
                        <th>Semestre</th>
                        <th>Type</th>
                        <th style="text-align: center;">Coefficient</th>
                        <th style="text-align: right;">Note</th>
                        <th style="text-align: right;">Pondérée</th>
                        <th style="text-align: center;">Statut</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $notesByModule = $notes->groupBy('module_id');
                    @endphp
                    @foreach($notesByModule as $moduleId => $moduleNotes)
                        @php
                            $module = $moduleNotes->first()->module;
                            $moduleTotal = 0;
                            $moduleWeight = 0;
                        @endphp
                        @foreach($moduleNotes as $note)
                            @php
                                $coef = $note->coef?->coef ?? 1;
                                $weighted = $note->note * $coef;
                                $moduleTotal += $weighted;
                                $moduleWeight += $coef;
                                $date = $note->created_at ? \Carbon\Carbon::parse($note->created_at)->format('d/m/Y') : 'N/A';
                                $gradeClass = $note->note >= 16 ? 'grade-excellent' : ($note->note >= 10 ? 'grade-good' : 'grade-fail');
                            @endphp
                            <tr>
                                <td>{{ $date }}</td>
                                <td><strong>{{ $module?->libelle ?? 'N/A' }}</strong></td>
                                <td>S{{ $module?->semestre ?? 'N/A' }}</td>
                                <td><span class="badge badge-pass">{{ $note->coef?->libelle ?? 'N/A' }}</span></td>
                                <td style="text-align: center;">{{ number_format($coef, 1) }}</td>
                                <td style="text-align: right;" class="{{ $gradeClass }}">{{ number_format($note->note, 2) }}</td>
                                <td style="text-align: right;">{{ number_format($weighted, 2) }}</td>
                                <td style="text-align: center;">
                                    <span class="badge {{ $note->note >= 10 ? 'badge-pass' : 'badge-fail' }}">
                                        {{ $note->note >= 10 ? 'Validé' : 'Non validé' }}
                                    </span>
                                </td>
                            </tr>
                        @endforeach
                        @php
                            $moduleAverage = $moduleWeight > 0 ? $moduleTotal / $moduleWeight : 0;
                        @endphp
                        <tr style="background: #f8fafc; font-weight: bold;">
                            <td colspan="5" style="text-align: right; padding-right: 20px;">Moyenne du module:</td>
                            <td style="text-align: right;" class="{{ $moduleAverage >= 10 ? 'grade-good' : 'grade-fail' }}">
                                {{ number_format($moduleAverage, 2) }}/20
                            </td>
                            <td colspan="2"></td>
                        </tr>
                        <tr><td colspan="8" style="height: 10px; border: none;"></td></tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">
                Aucune note disponible pour la période sélectionnée.
            </div>
        @endif
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>Ce document a été généré automatiquement le {{ date('d/m/Y à H:i') }}</p>
        <p>Document officiel - Ne pas modifier</p>
    </div>
</body>
</html>
