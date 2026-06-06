<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Invitation — ISI SUPTECH</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
  .header { background: linear-gradient(135deg, #1E3A8A 0%, #0EA5E9 100%); padding: 40px 32px; text-align: center; }
  .header img { height: 60px; margin-bottom: 16px; }
  .header h1 { color: #fff; font-size: 22px; margin: 0; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
  .body { padding: 36px 32px; }
  .greeting { font-size: 18px; font-weight: 600; color: #1E3A8A; margin-bottom: 16px; }
  .text { color: #374151; font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
  .credentials { background: #F0F9FF; border: 2px solid #0EA5E9; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
  .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
  .cred-row:last-child { border-bottom: none; }
  .cred-label { color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .cred-value { color: #1E3A8A; font-size: 15px; font-weight: 700; font-family: monospace; }
  .btn { display: block; width: fit-content; margin: 28px auto; background: linear-gradient(135deg, #1E3A8A, #0EA5E9); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-size: 16px; font-weight: 700; text-align: center; }
  .info-box { background: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #92400E; }
  .footer { background: #F8FAFC; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
  .footer strong { color: #1E3A8A; }
  .badge { display: inline-block; background: #EFF6FF; color: #1E3A8A; border-radius: 20px; padding: 4px 14px; font-size: 13px; font-weight: 600; margin: 4px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🎓 ISI / SUPTECH</h1>
    <p>Plateforme d'Évaluation des Formations</p>
  </div>
  <div class="body">
    <div class="greeting">Bonjour {{ $invitation->nom ?? 'Étudiant(e)' }} 👋</div>
    <p class="text">
      Vous êtes invité(e) à participer à l'évaluation des enseignements et des formations
      d'<strong>ISI / SUPTECH</strong>. Votre avis est précieux pour améliorer la qualité
      de nos formations.
    </p>

    @if($invitation->filiere || $invitation->classe)
    <p class="text">
      <strong>Votre affectation :</strong><br>
      @if($invitation->filiere)
        <span class="badge">📚 {{ $invitation->filiere->nom }}</span>
      @endif
      @if($invitation->classe)
        <span class="badge">🏫 {{ $invitation->classe->nom }}</span>
      @endif
    </p>
    @endif

    <p class="text">Voici vos identifiants de connexion :</p>

    <div class="credentials">
      <div class="cred-row">
        <span class="cred-label">📧 Email</span>
        <span class="cred-value">{{ $invitation->email }}</span>
      </div>
      <div class="cred-row">
        <span class="cred-label">🔑 Mot de passe temporaire</span>
        <span class="cred-value">{{ $tempPassword }}</span>
      </div>
    </div>

    <div class="info-box">
      ⚠️ <strong>Important :</strong> Ce mot de passe est temporaire. Une fois connecté(e),
      vous pourrez le modifier depuis votre profil. Ce lien d'invitation expire dans <strong>7 jours</strong>.
    </div>

    <a href="{{ env('FRONTEND_URL') }}/login" class="btn">
      🚀 Accéder à la plateforme
    </a>

    <p class="text" style="font-size:13px; color:#94a3b8; text-align:center;">
      Ou copiez ce lien : {{ env('FRONTEND_URL') }}/login
    </p>
  </div>
  <div class="footer">
    <p>Développé par <strong>MULTI BRAIN TECH</strong> pour ISI / SUPTECH</p>
    <p>© {{ date('Y') }} ISI / SUPTECH — Dakar, Sénégal</p>
    <p style="font-size:11px;">Cet email est automatique, merci de ne pas y répondre.</p>
  </div>
</div>
</body>
</html>
