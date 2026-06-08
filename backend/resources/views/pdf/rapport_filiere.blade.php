<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport Filière — {{ $filiere->nom }}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10px; color: #1f2937; background: #fff; }
  .header { background: linear-gradient(135deg, #1E3A8A, #0EA5E9); color: white; padding: 20px 30px; margin-bottom: 20px; }
  .header h1 { font-size: 18px; font-weight: 700; }
  .header p  { font-size: 10px; opacity: 0.85; margin-top: 4px; }
  .section { padding: 0 30px 20px; }
  .section-title { font-size: 13px; font-weight: 700; color: #1E3A8A; border-bottom: 2px solid #1E3A8A; padding-bottom: 6px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 9px; }
  th { background: #1E3A8A; color: white; padding: 6px 8px; text-align: left; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f0f9ff; }
  .score-high  { color: #059669; font-weight: 700; }
  .score-med   { color: #d97706; font-weight: 700; }
  .score-low   { color: #dc2626; font-weight: 700; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 8px; font-weight: 700; }
  .badge-blue  { background: #dbeafe; color: #1e40af; }
  .footer { margin-top: 20px; padding: 12px 30px; background: #f8fafc; border-top: 1px solid #e5e7eb; font-size: 8px; color: #6b7280; text-align: center; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
  .stat-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 10px; text-align: center; }
  .stat-number { font-size: 18px; font-weight: 700; color: #1E3A8A; }
  .stat-label  { font-size: 8px; color: #64748b; margin-top: 2px; }
  .classe-header { background: #dbeafe; padding: 8px 10px; border-radius: 6px; margin: 12px 0 8px; font-weight: 700; font-size: 11px; color: #1e40af; }
</style>
</head>
<body>
<div class="header">
  <h1>📊 Rapport d'Évaluation — {{ $filiere->nom }}</h1>
  <p>Année scolaire : {{ $annee }} &nbsp;|&nbsp; Généré le : {{ $generated }} &nbsp;|&nbsp; ISI / SUPTECH &nbsp;|&nbsp; Développé par MULTI BRAIN TECH</p>
</div>

<div class="section">
  <div class="section-title">Résumé par Classe</div>
  @foreach($classes as $classe)
    <div class="classe-header">{{ $classe['nom'] }} ({{ $classe['niveau'] }}) — {{ $classe['effectif'] }} étudiants</div>
    <table>
      <thead>
        <tr>
          <th>Matière</th>
          <th>Professeur</th>
          <th>Réponses</th>
          <th>Score Moyen</th>
          <th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Q5</th>
          <th>Q6</th><th>Q7</th><th>Q8</th><th>Q9</th><th>Q10</th>
        </tr>
      </thead>
      <tbody>
        @foreach($classe['matieres'] as $m)
        <tr>
          <td><strong>{{ $m['matiere'] }}</strong></td>
          <td>{{ $m['professeur'] ?? '—' }}</td>
          <td>{{ $m['nb_reponses'] }}</td>
          <td>
            <span class="{{ $m['score_moyen'] >= 75 ? 'score-high' : ($m['score_moyen'] >= 50 ? 'score-med' : 'score-low') }}">
              {{ $m['score_moyen'] }}%
            </span>
          </td>
          @foreach(range(1,10) as $i)
          @php
            $qd = $m['questions']["q$i"] ?? ['A'=>0,'B'=>0,'C'=>0];
            $qscore = round($qd['A']*0.5 + $qd['B']*0.75 + $qd['C']*1.0);
          @endphp
          <td class="{{ $qscore >= 75 ? 'score-high' : ($qscore >= 50 ? 'score-med' : ($qscore > 0 ? 'score-low' : '')) }}">{{ $qscore > 0 ? $qscore.'%' : '—' }}</td>
          @endforeach
        </tr>
        @if(!empty($m['commentaires']))
        <tr>
          <td colspan="14" style="font-style:italic; color:#6b7280; font-size:8px; background:#fafafa;">
            Commentaires : @foreach($m['commentaires'] as $c) • {{ $c }} @endforeach
          </td>
        </tr>
        @endif
        @endforeach
      </tbody>
    </table>
  @endforeach
</div>

<div class="footer">
  Rapport généré automatiquement par la Plateforme d'Évaluation ISI SUPTECH &nbsp;|&nbsp; Développé par <strong>MULTI BRAIN TECH</strong>
</div>
</body>
</html>
