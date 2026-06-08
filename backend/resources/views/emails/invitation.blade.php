<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Invitation — ISI SUPTECH</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 40px auto; padding: 0 16px; }
  .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: #1E3A8A; padding: 40px 40px 32px; text-align: center; }
  .header-brand { color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
  .header-sub { color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
  .header-tag { display: inline-block; background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.2); border-radius: 50px; padding: 6px 18px; font-size: 13px; font-weight: 600; }
  .body { padding: 40px; }
  .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
  .text { color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
  .badges { margin-bottom: 24px; }
  .badge { display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 20px; padding: 5px 14px; font-size: 13px; font-weight: 600; margin: 3px 3px 3px 0; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }
  .section-label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
  .credentials { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
  .cred-row { padding: 14px 20px; border-bottom: 1px solid #e2e8f0; }
  .cred-row:last-child { border-bottom: none; }
  .cred-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .cred-value { font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Courier New', 'Consolas', monospace; letter-spacing: 0.02em; }
  .notice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #78350f; margin-bottom: 28px; line-height: 1.5; }
  .btn-wrap { text-align: center; margin-bottom: 24px; }
  .btn { display: inline-block; background: #1E3A8A; color: #ffffff; text-decoration: none; padding: 15px 44px; border-radius: 50px; font-size: 15px; font-weight: 700; letter-spacing: 0.02em; }
  .link-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; word-break: break-all; font-size: 12px; color: #64748b; text-align: center; }
  .footer { background: #f8fafc; padding: 28px 40px; border-top: 1px solid #e2e8f0; text-align: center; }
  .footer p { color: #94a3b8; font-size: 12px; margin: 5px 0; }
  .footer strong { color: #1e40af; font-weight: 700; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">

    <div class="header">
      <div class="header-brand">ISI / SUPTECH</div>
      <div class="header-sub">Institut Supérieur d'Informatique</div>
      <div class="header-tag">Plateforme d'Évaluation des Formations</div>
    </div>

    <div class="body">
      <div class="greeting">Bienvenue, {{ $invitation->nom ?? 'Étudiant(e)' }}</div>
      <p class="text">
        Vous êtes invité(e) à rejoindre la <strong>Plateforme d'Évaluation ISI SUPTECH</strong>.
        Vos retours nous permettent d'améliorer continuellement la qualité de nos formations et des services.
      </p>

      @if($invitation->filiere || $invitation->classe)
      <div class="badges">
        @if($invitation->filiere)
          <span class="badge">Filière : {{ $invitation->filiere->nom }}</span>
        @endif
        @if($invitation->classe)
          <span class="badge">Classe : {{ $invitation->classe->nom }}</span>
        @endif
      </div>
      @endif

      <hr class="divider">

      <div class="section-label">Vos identifiants de connexion</div>
      <div class="credentials">
        <div class="cred-row">
          <div class="cred-label">Adresse email</div>
          <div class="cred-value">{{ $invitation->email }}</div>
        </div>
        <div class="cred-row">
          <div class="cred-label">Mot de passe temporaire</div>
          <div class="cred-value">{{ $tempPassword }}</div>
        </div>
      </div>

      <div class="notice">
        <strong>Important :</strong> Ce mot de passe est temporaire.
        Modifiez-le dès votre première connexion depuis votre profil.
        Cette invitation expire dans <strong>7 jours</strong>.
      </div>

      <div class="btn-wrap">
        <a href="{{ env('FRONTEND_URL') }}/login" class="btn">Accéder à la plateforme</a>
      </div>

      <div class="link-box">
        Ou copiez ce lien dans votre navigateur :<br>
        {{ env('FRONTEND_URL') }}/login
      </div>
    </div>

    <div class="footer">
      <p>Développé par <strong>MULTI BRAIN TECH</strong> pour ISI / SUPTECH</p>
      <p>© {{ date('Y') }} ISI / SUPTECH — Dakar, Sénégal</p>
      <p style="font-size:11px; margin-top:8px;">Cet email est automatique, merci de ne pas y répondre directement.</p>
    </div>

  </div>
</div>
</body>
</html>
