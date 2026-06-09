<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Résultats de vos évaluations</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 0; }
  .wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #0891b2 100%); padding: 40px 40px 32px; text-align: center; }
  .header img { height: 48px; margin-bottom: 16px; }
  .header h1 { color: #fff; font-size: 22px; font-weight: 800; margin: 0 0 6px; letter-spacing: -0.3px; }
  .header p { color: rgba(255,255,255,0.75); font-size: 14px; margin: 0; }
  .body { padding: 36px 40px; }
  .greeting { font-size: 16px; color: #1e293b; margin-bottom: 20px; }
  .score-box { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1.5px solid #86efac; border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0; }
  .score-box .score-value { font-size: 52px; font-weight: 900; color: #16a34a; line-height: 1; }
  .score-box .score-label { font-size: 13px; color: #166534; margin-top: 6px; font-weight: 600; }
  .score-box.avg { background: linear-gradient(135deg, #fffbeb, #fef9c3); border-color: #fde68a; }
  .score-box.avg .score-value { color: #d97706; }
  .score-box.avg .score-label { color: #92400e; }
  .score-box.low { background: linear-gradient(135deg, #fff1f2, #ffe4e6); border-color: #fca5a5; }
  .score-box.low .score-value { color: #dc2626; }
  .score-box.low .score-label { color: #991b1b; }
  .message-box { border-radius: 12px; padding: 20px 24px; margin: 20px 0; font-size: 15px; line-height: 1.6; }
  .message-box.encourage { background: #f0fdf4; border-left: 4px solid #22c55e; color: #166534; }
  .message-box.progress { background: #fffbeb; border-left: 4px solid #f59e0b; color: #92400e; }
  .message-box.action { background: #fff1f2; border-left: 4px solid #ef4444; color: #991b1b; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
  .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
  .info-card .info-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .info-card .info-value { font-size: 15px; color: #1e293b; font-weight: 700; }
  .pdf-note { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #1d4ed8; margin: 20px 0; display: flex; align-items: center; gap: 10px; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center; }
  .footer p { color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.6; }
  .footer strong { color: #64748b; }
</style>
</head>
<body>
<div style="padding: 24px 16px;">
<div class="wrapper">

  <div class="header">
    <h1>📊 Résultats de vos évaluations</h1>
    <p>ISI / SUPTECH — Plateforme d'évaluation de la formation</p>
  </div>

  <div class="body">
    <p class="greeting">
      Cher(e) <strong>{{ $prof->prenom }} {{ $prof->nom }}</strong>,
    </p>

    <p style="color:#475569;font-size:14px;line-height:1.7;">
      Tous les étudiants de la classe <strong>{{ $classe }}</strong> ont terminé l'évaluation
      de votre cours de <strong>{{ $matiere }}</strong>. Voici un récapitulatif de leurs retours.
    </p>

    {{-- Score box --}}
    @php
      $boxClass = $scoreMoyen >= 75 ? '' : ($scoreMoyen >= 50 ? 'avg' : 'low');
    @endphp
    <div class="score-box {{ $boxClass }}">
      <div class="score-value">{{ number_format($scoreMoyen, 1) }}%</div>
      <div class="score-label">Score moyen de satisfaction — {{ $count }} réponse{{ $count > 1 ? 's' : '' }}</div>
    </div>

    {{-- Motivational message --}}
    @if($scoreMoyen >= 75)
    <div class="message-box encourage">
      🏆 <strong>Félicitations !</strong> Vos étudiants sont très satisfaits de vos enseignements.
      Votre pédagogie, votre disponibilité et votre engagement font la différence.
      Continuez sur cette lancée — vous êtes un pilier de l'excellence à ISI SUPTECH !
    </div>
    @elseif($scoreMoyen >= 50)
    <div class="message-box progress">
      💪 <strong>Bon travail !</strong> Vos étudiants apprécient globalement votre cours.
      Quelques ajustements dans votre approche pédagogique pourraient encore améliorer leur satisfaction.
      Nous restons disponibles pour tout échange constructif.
    </div>
    @else
    <div class="message-box action">
      🤝 <strong>Un appel à l'amélioration.</strong> Les résultats de cette évaluation montrent
      que des efforts supplémentaires sont nécessaires pour mieux répondre aux attentes des étudiants.
      Nous vous invitons à prendre contact avec la direction pédagogique pour en discuter ensemble.
    </div>
    @endif

    {{-- Info cards --}}
    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">Matière</div>
        <div class="info-value">{{ $matiere }}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Classe</div>
        <div class="info-value">{{ $classe }}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Étudiants évalués</div>
        <div class="info-value">{{ $count }}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Année scolaire</div>
        <div class="info-value">2025-2026</div>
      </div>
    </div>

    <div class="pdf-note">
      📎 <span>Un rapport PDF complet avec le détail de chaque réponse et les commentaires des étudiants est joint à cet email.</span>
    </div>

    <p style="color:#475569;font-size:13px;line-height:1.7;margin-top:20px;">
      Merci pour votre contribution à la formation de nos étudiants.<br>
      L'équipe de direction reste à votre disposition pour tout échange.
    </p>
  </div>

  <div class="footer">
    <p>
      <strong>ISI / SUPTECH</strong> — Groupe ISI<br>
      Plateforme d'Évaluation de la Formation<br>
      <span style="color:#cbd5e1;">Cet email a été généré automatiquement — merci de ne pas y répondre.</span>
    </p>
  </div>

</div>
</div>
</body>
</html>
