<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport Étudiant — {{ $student->name }}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 9px; color: #1f2937; }
  .header { background: linear-gradient(135deg, #1E3A8A, #0EA5E9); color: white; padding: 14px 24px; margin-bottom: 14px; }
  .header h1 { font-size: 14px; font-weight: 700; }
  .header p  { font-size: 8px; opacity: 0.85; margin-top: 3px; }
  .header-meta { display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; }
  .meta-item { background: rgba(255,255,255,0.15); border-radius: 4px; padding: 3px 8px; font-size: 8px; }
  .section { padding: 0 24px 12px; }
  .section-title { font-size: 11px; font-weight: 700; color: #1E3A8A; border-bottom: 2px solid #1E3A8A; padding-bottom: 4px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 8px; }
  th { background: #1E3A8A; color: white; padding: 5px 6px; text-align: center; }
  th:first-child { text-align: left; }
  td { padding: 4px 6px; border-bottom: 1px solid #e5e7eb; text-align: center; }
  td:first-child { text-align: left; }
  tr:nth-child(even) td { background: #f0f9ff; }
  .a { color: #dc2626; font-weight: 700; }
  .b { color: #d97706; font-weight: 700; }
  .c { color: #059669; font-weight: 700; }
  .score-high { color: #059669; font-weight: 700; }
  .score-med  { color: #d97706; font-weight: 700; }
  .score-low  { color: #dc2626; font-weight: 700; }
  .ts { color: #059669; } .s { color: #0891b2; } .ps { color: #d97706; } .pas { color: #ea580c; } .pdt { color: #dc2626; }
  .footer { margin-top: 10px; padding: 8px 24px; background: #f8fafc; border-top: 1px solid #e5e7eb; font-size: 7px; color: #6b7280; text-align: center; }
  .badge-oui { color: #059669; font-weight: 700; }
  .badge-non { color: #dc2626; font-weight: 700; }
  .comment { font-style: italic; color: #6b7280; font-size: 7.5px; }
</style>
</head>
<body>

<div class="header">
  <h1>Rapport d'Évaluation Individuel — {{ $student->name }}</h1>
  <p>Année : {{ $annee }} &nbsp;|&nbsp; Généré le : {{ $generated }} &nbsp;|&nbsp; ISI / SUPTECH &nbsp;|&nbsp; MULTI BRAIN TECH</p>
  <div class="header-meta">
    <span class="meta-item">Email : {{ $student->email }}</span>
    @if($student->filiere)<span class="meta-item">Filière : {{ $student->filiere->nom }}</span>@endif
    @if($student->classe)<span class="meta-item">Classe : {{ $student->classe->nom }}</span>@endif
  </div>
</div>

{{-- ══ SECTION 1 : ENSEIGNEMENTS ══ --}}
@if($evalEns->count() > 0)
<div class="section">
  <div class="section-title">Évaluations des Enseignements ({{ $evalEns->count() }} matière(s))</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left">Matière</th>
        <th>Professeur</th>
        <th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Q5</th>
        <th>Q6</th><th>Q7</th><th>Q8</th><th>Q9</th><th>Q10</th>
        <th>Score</th>
        <th>Commentaire</th>
      </tr>
    </thead>
    <tbody>
      @foreach($evalEns as $e)
      @php
        $matiereName = $e->matiere?->nom ?? $e->cmp?->matiere?->nom ?? '—';
        $profName = $e->cmp ? trim(($e->cmp->professeur?->prenom ?? '').' '.($e->cmp->professeur?->nom ?? '')) : '—';
      @endphp
      <tr>
        <td><strong>{{ $matiereName }}</strong></td>
        <td>{{ $profName ?: '—' }}</td>
        @foreach(['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'] as $q)
        @php $val = $e->$q ?? '—'; $cls = $val === 'A' ? 'a' : ($val === 'B' ? 'b' : ($val === 'C' ? 'c' : '')); @endphp
        <td class="{{ $cls }}">{{ $val }}</td>
        @endforeach
        <td class="{{ $e->score_total >= 75 ? 'score-high' : ($e->score_total >= 50 ? 'score-med' : 'score-low') }}">{{ $e->score_total }}%</td>
        <td class="comment">{{ $e->commentaire ? '"'.Str::limit($e->commentaire, 40).'"' : '' }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>
@endif

{{-- ══ SECTION 2 : QUALITÉ DE SERVICE ══ --}}
@if($evalQual)
<div class="section">
  <div class="section-title">Évaluation Qualité de Service</div>
  <table>
    <thead>
      <tr>
        @foreach($services as $key => $label)
        <th>{{ $label }}</th>
        @endforeach
        <th>Recommande</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        @foreach($services as $key => $label)
        @php
          $val = $evalQual->$key ?? null;
          $label_val = $niveauxLabels[$val] ?? '—';
          $cls = match($val) { 'tres_satisfait' => 'ts', 'satisfait' => 's', 'peu_satisfait' => 'ps', 'pas_satisfait' => 'pas', 'pas_du_tout' => 'pdt', default => '' };
        @endphp
        <td class="{{ $cls }}">{{ $label_val }}</td>
        @endforeach
        <td class="{{ $evalQual->recommande ? 'badge-oui' : 'badge-non' }}">{{ $evalQual->recommande ? 'Oui' : 'Non' }}</td>
      </tr>
    </tbody>
  </table>
  @if($evalQual->commentaire)
  <p class="comment" style="padding: 4px 0 8px;">"{{ $evalQual->commentaire }}"</p>
  @endif
</div>
@endif

{{-- ══ SECTION 3 : FORMATION ══ --}}
@if($evalForm)
<div class="section">
  <div class="section-title">Évaluation de la Formation</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left">Critère</th>
        <th>Note (/5)</th>
      </tr>
    </thead>
    <tbody>
      @php
        $scoreItems = [
          'score_motivation'       => "Motivation à suivre le cours",
          'score_objectifs'        => "Clarté des objectifs",
          'score_contenu'          => "Pertinence du contenu",
          'score_techniques'       => "Techniques d'enseignement",
          'score_exercices'        => "Pertinence des exercices",
          'score_formateur_comm'   => "Communication du formateur",
          'score_formateur_rythme' => "Rythme d'apprentissage",
          'score_connaissance'     => "Progression des connaissances",
          'score_application'      => "Application des compétences",
          'score_recommandation'   => "Recommandation de la formation",
        ];
      @endphp
      @foreach($scoreItems as $key => $label)
        @if($evalForm->$key !== null)
        <tr>
          <td>{{ $label }}</td>
          <td class="{{ $evalForm->$key >= 4 ? 'score-high' : ($evalForm->$key >= 3 ? 'score-med' : 'score-low') }}">{{ $evalForm->$key }}/5</td>
        </tr>
        @endif
      @endforeach
      @if($evalForm->score_moyen)
      <tr style="font-weight:700; background:#f0f9ff;">
        <td><strong>Score moyen</strong></td>
        <td class="{{ $evalForm->score_moyen >= 4 ? 'score-high' : ($evalForm->score_moyen >= 3 ? 'score-med' : 'score-low') }}">{{ number_format($evalForm->score_moyen,1) }}/5</td>
      </tr>
      @endif
    </tbody>
  </table>
  @if($evalForm->commentaires_suggestions)
  <p class="comment">"{{ $evalForm->commentaires_suggestions }}"</p>
  @endif
</div>
@endif

<div class="footer">
  Rapport individuel généré automatiquement — Plateforme ISI SUPTECH &nbsp;|&nbsp; Développé par <strong>MULTI BRAIN TECH</strong>
</div>
</body>
</html>
