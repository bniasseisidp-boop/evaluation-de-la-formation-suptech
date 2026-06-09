<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; }
  body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10px; color: #1e293b; margin: 0; padding: 0; background: #fff; }
  .page { padding: 22px 26px; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 18px; }
  .header-left h1 { font-size: 17px; font-weight: 900; color: #1e3a5f; margin: 0 0 2px; }
  .header-left p { font-size: 9px; color: #64748b; margin: 0; }
  .header-right { text-align: right; font-size: 9px; color: #94a3b8; }
  .badge { display: inline-block; background: #1e3a5f; color: #fff; border-radius: 20px; padding: 2px 10px; font-size: 9px; font-weight: 700; }

  /* Meta */
  .meta-grid { display: table; width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .meta-cell { display: table-cell; width: 25%; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 0; }
  .meta-label { font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.4px; margin-bottom: 3px; }
  .meta-value { font-size: 11px; color: #1e293b; font-weight: 700; }

  /* Score banner */
  .score-banner { margin-bottom: 16px; }
  .score-banner-inner { border-radius: 10px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
  .score-banner-inner.green { background: #f0fdf4; border: 1.5px solid #86efac; }
  .score-banner-inner.yellow { background: #fffbeb; border: 1.5px solid #fde68a; }
  .score-banner-inner.red { background: #fff1f2; border: 1.5px solid #fca5a5; }
  .score-big { font-size: 32px; font-weight: 900; }
  .score-big.green { color: #16a34a; }
  .score-big.yellow { color: #d97706; }
  .score-big.red { color: #dc2626; }
  .score-label-big { font-size: 10px; font-weight: 600; }
  .score-label-big.green { color: #166534; }
  .score-label-big.yellow { color: #92400e; }
  .score-label-big.red { color: #991b1b; }
  .score-msg { font-size: 9px; max-width: 400px; line-height: 1.5; }
  .score-msg.green { color: #166534; }
  .score-msg.yellow { color: #92400e; }
  .score-msg.red { color: #991b1b; }

  /* Tables */
  .section-title { font-size: 11px; font-weight: 900; color: #1e3a5f; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; border-left: 3px solid #0891b2; padding-left: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 9px; }
  th { background: #1e3a5f; color: #fff; padding: 6px 8px; text-align: center; font-weight: 700; font-size: 8px; text-transform: uppercase; letter-spacing: 0.3px; }
  th.left { text-align: left; }
  td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
  tr:nth-child(even) td { background: #f8fafc; }
  .td-center { text-align: center; }
  .td-right { text-align: right; }

  /* Answer cells */
  .ans-a { background: #fee2e2; color: #991b1b; border-radius: 4px; padding: 1px 5px; font-weight: 700; font-size: 8px; }
  .ans-b { background: #fef9c3; color: #854d0e; border-radius: 4px; padding: 1px 5px; font-weight: 700; font-size: 8px; }
  .ans-c { background: #dcfce7; color: #166534; border-radius: 4px; padding: 1px 5px; font-weight: 700; font-size: 8px; }

  /* Bar */
  .bar-wrap { background: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden; width: 100%; }
  .bar-fill-a { height: 8px; border-radius: 4px; background: #f87171; }
  .bar-fill-b { height: 8px; border-radius: 4px; background: #facc15; }
  .bar-fill-c { height: 8px; border-radius: 4px; background: #4ade80; }

  /* Comments */
  .comment-item { background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 6px; padding: 6px 10px; margin-bottom: 6px; font-size: 9px; color: #1e40af; font-style: italic; }

  /* Footer */
  .footer { border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8; }
</style>
</head>
<body>
<div class="page">

  {{-- Header --}}
  <div class="header">
    <div class="header-left">
      <h1>Rapport d'Évaluation — Professeur</h1>
      <p>ISI / SUPTECH — Plateforme d'évaluation de la formation &nbsp;|&nbsp; Année {{ $annee }}</p>
    </div>
    <div class="header-right">
      <div class="badge">CONFIDENTIEL</div><br>
      Généré le {{ $generated }}
    </div>
  </div>

  {{-- Meta info --}}
  <table class="meta-grid">
    <tr>
      <td class="meta-cell">
        <div class="meta-label">Professeur</div>
        <div class="meta-value">{{ $cmp->professeur->prenom }} {{ $cmp->professeur->nom }}</div>
      </td>
      <td class="meta-cell">
        <div class="meta-label">Grade</div>
        <div class="meta-value">{{ $cmp->professeur->grade ?? '—' }}</div>
      </td>
      <td class="meta-cell">
        <div class="meta-label">Matière</div>
        <div class="meta-value">{{ $cmp->matiere->nom }}</div>
      </td>
      <td class="meta-cell">
        <div class="meta-label">Classe</div>
        <div class="meta-value">{{ $cmp->classe->nom }}</div>
      </td>
    </tr>
  </table>

  {{-- Score banner --}}
  @php
    $cls = $scoreMoyen >= 75 ? 'green' : ($scoreMoyen >= 50 ? 'yellow' : 'red');
    $msg = $scoreMoyen >= 75
      ? 'Excellente satisfaction des étudiants. Le professeur répond pleinement aux attentes pédagogiques.'
      : ($scoreMoyen >= 50
        ? 'Satisfaction correcte avec des marges de progression identifiées sur certains critères.'
        : 'Des améliorations significatives sont nécessaires pour mieux répondre aux attentes des étudiants.');
  @endphp
  <div class="score-banner">
    <div class="score-banner-inner {{ $cls }}">
      <div>
        <div class="score-big {{ $cls }}">{{ number_format($scoreMoyen, 1) }}%</div>
        <div class="score-label-big {{ $cls }}">Score moyen de satisfaction</div>
      </div>
      <div class="score-msg {{ $cls }}">
        <strong>{{ $count }} étudiant{{ $count > 1 ? 's' : '' }} ont participé à cette évaluation.</strong><br>
        {{ $msg }}
      </div>
    </div>
  </div>

  {{-- Q1-Q10 breakdown --}}
  <div class="section-title">Répartition par question (A = 50% · B = 75% · C = 100%)</div>
  @php
  $qLabels = [
    'q1'  => 'Q1 — Grandes lignes du programme déclinées',
    'q2'  => 'Q2 — Programme suivi',
    'q3'  => 'Q3 — Travail à la maison donné',
    'q4'  => 'Q4 — Enseignements compris',
    'q5'  => 'Q5 — Répond aux questions',
    'q6'  => 'Q6 — Ponctualité respectée',
    'q7'  => 'Q7 — Objectifs atteints',
    'q8'  => 'Q8 — Temps d\'enseignement maximisé',
    'q9'  => 'Q9 — Corrélation avec la filière',
    'q10' => 'Q10 — Satisfaction globale',
  ];
  @endphp
  <table>
    <thead>
      <tr>
        <th class="left" style="width:34%">Question</th>
        <th style="width:8%">A (50%)</th>
        <th style="width:8%">B (75%)</th>
        <th style="width:8%">C (100%)</th>
        <th style="width:42%">Répartition</th>
      </tr>
    </thead>
    <tbody>
      @foreach($qLabels as $qKey => $qLabel)
      @php $q = $questionsStats[$qKey] ?? ['A'=>0,'B'=>0,'C'=>0]; @endphp
      <tr>
        <td>{{ $qLabel }}</td>
        <td class="td-center"><span class="ans-a">{{ $q['A'] }}%</span></td>
        <td class="td-center"><span class="ans-b">{{ $q['B'] }}%</span></td>
        <td class="td-center"><span class="ans-c">{{ $q['C'] }}%</span></td>
        <td>
          <table style="width:100%;border:none;margin:0;" cellspacing="2" cellpadding="0">
            <tr>
              <td style="width:{{ $q['A'] }}%;padding:1px 0;"><div class="bar-fill-a" style="height:5px;width:100%"></div></td>
              <td style="width:{{ $q['B'] }}%;padding:1px 0;"><div class="bar-fill-b" style="height:5px;width:100%"></div></td>
              <td style="width:{{ $q['C'] }}%;padding:1px 0;"><div class="bar-fill-c" style="height:5px;width:100%"></div></td>
              @if($q['A']+$q['B']+$q['C'] < 100)
              <td style="width:{{ 100-$q['A']-$q['B']-$q['C'] }}%;"></td>
              @endif
            </tr>
          </table>
        </td>
      </tr>
      @endforeach
    </tbody>
  </table>

  {{-- Individual responses --}}
  <div class="section-title">Réponses individuelles des étudiants</div>
  <table>
    <thead>
      <tr>
        <th class="left" style="width:18%">Étudiant</th>
        <th style="width:5%">Q1</th>
        <th style="width:5%">Q2</th>
        <th style="width:5%">Q3</th>
        <th style="width:5%">Q4</th>
        <th style="width:5%">Q5</th>
        <th style="width:5%">Q6</th>
        <th style="width:5%">Q7</th>
        <th style="width:5%">Q8</th>
        <th style="width:5%">Q9</th>
        <th style="width:5%">Q10</th>
        <th style="width:8%">Score</th>
        <th class="left" style="width:24%">Commentaire</th>
      </tr>
    </thead>
    <tbody>
      @foreach($evals as $eval)
      <tr>
        <td>{{ \Illuminate\Support\Str::limit($eval->etudiant->name ?? '—', 22) }}</td>
        @foreach(['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'] as $q)
        <td class="td-center">
          @if($eval->$q)
            <span class="ans-{{ strtolower($eval->$q) }}">{{ $eval->$q }}</span>
          @else
            <span style="color:#cbd5e1">—</span>
          @endif
        </td>
        @endforeach
        <td class="td-center" style="font-weight:700;color:{{ ($eval->score_total ?? 0) >= 75 ? '#16a34a' : (($eval->score_total ?? 0) >= 50 ? '#d97706' : '#dc2626') }}">
          {{ number_format($eval->score_total ?? 0, 0) }}%
        </td>
        <td style="font-style:italic;color:#475569;">{{ \Illuminate\Support\Str::limit($eval->commentaire ?? '', 50) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  {{-- Comments section --}}
  @php $comments = $evals->pluck('commentaire')->filter()->values(); @endphp
  @if($comments->count() > 0)
  <div class="section-title">Commentaires libres des étudiants ({{ $comments->count() }})</div>
  @foreach($comments as $comment)
  <div class="comment-item">"{{ $comment }}"</div>
  @endforeach
  @endif

  {{-- Footer --}}
  <div class="footer">
    <span>ISI / SUPTECH — Rapport confidentiel destiné au corps enseignant</span>
    <span>Généré automatiquement le {{ $generated }}</span>
  </div>

</div>
</body>
</html>
