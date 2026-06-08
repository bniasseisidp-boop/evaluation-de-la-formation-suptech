<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport Classe — {{ $classe->nom }}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10px; color: #1f2937; }
  .header { background: linear-gradient(135deg, #1E3A8A, #0EA5E9); color: white; padding: 18px 28px; margin-bottom: 18px; }
  .header h1 { font-size: 16px; font-weight: 700; }
  .header p  { font-size: 9px; opacity: 0.85; margin-top: 4px; }
  .section { padding: 0 28px 18px; }
  .section-title { font-size: 12px; font-weight: 700; color: #1E3A8A; border-bottom: 2px solid #1E3A8A; padding-bottom: 5px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9px; }
  th { background: #1E3A8A; color: white; padding: 5px 7px; text-align: center; }
  td { padding: 4px 7px; border-bottom: 1px solid #e5e7eb; text-align: center; }
  td:first-child, td:nth-child(2) { text-align: left; }
  tr:nth-child(even) td { background: #f0f9ff; }
  .score-high { color: #059669; font-weight: 700; }
  .score-med  { color: #d97706; font-weight: 700; }
  .score-low  { color: #dc2626; font-weight: 700; }
  .footer { margin-top: 16px; padding: 10px 28px; background: #f8fafc; border-top: 1px solid #e5e7eb; font-size: 8px; color: #6b7280; text-align: center; }
</style>
</head>
<body>
<div class="header">
  <h1>📊 Rapport — {{ $classe->nom }} ({{ $classe->niveau }}) — {{ $classe->filiere->nom ?? '' }}</h1>
  <p>Année : {{ $annee }} &nbsp;|&nbsp; Généré le : {{ $generated }} &nbsp;|&nbsp; ISI / SUPTECH &nbsp;|&nbsp; MULTI BRAIN TECH</p>
</div>

<div class="section">
  <div class="section-title">Évaluation par Matière & Professeur</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left">Matière</th>
        <th style="text-align:left">Professeur</th>
        <th>Rép.</th>
        <th>Score</th>
        <th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Q5</th>
        <th>Q6</th><th>Q7</th><th>Q8</th><th>Q9</th><th>Q10</th>
      </tr>
    </thead>
    <tbody>
      @foreach($matieres as $m)
      <tr>
        <td><strong>{{ $m['matiere'] }}</strong></td>
        <td>{{ $m['professeur'] }}</td>
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
        <td colspan="14" style="font-style:italic; color:#6b7280; background:#fafafa;">
          💬 @foreach($m['commentaires'] as $c) • {{ $c }} @endforeach
        </td>
      </tr>
      @endif
      @endforeach
    </tbody>
  </table>
</div>

<div class="footer">
  Plateforme d'Évaluation ISI SUPTECH &nbsp;|&nbsp; Développé par <strong>MULTI BRAIN TECH</strong>
</div>
</body>
</html>
