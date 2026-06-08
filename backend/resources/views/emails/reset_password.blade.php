<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Réinitialisation de mot de passe — ISI SUPTECH</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 40px auto; padding: 0 16px; }
  .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: #1E3A8A; padding: 40px 40px 32px; text-align: center; }
  .header-brand { color: #ffffff; font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .header-sub { color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
  .header-tag { display: inline-block; background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.2); border-radius: 50px; padding: 6px 18px; font-size: 13px; font-weight: 600; }
  .body { padding: 40px; }
  .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
  .text { color: #475569; font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
  .notice { background: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #78350f; margin-bottom: 28px; }
  .btn-wrap { text-align: center; margin-bottom: 24px; }
  .btn { display: inline-block; background: #1E3A8A; color: #ffffff; text-decoration: none; padding: 15px 44px; border-radius: 50px; font-size: 15px; font-weight: 700; }
  .link-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; word-break: break-all; font-size: 11px; color: #64748b; text-align: center; }
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
      <div class="header-tag">Réinitialisation de mot de passe</div>
    </div>
    <div class="body">
      <div class="greeting">Bonjour, {{ $user->name }}</div>
      <p class="text">
        Vous avez demandé la réinitialisation de votre mot de passe sur la
        <strong>Plateforme d'Évaluation ISI SUPTECH</strong>.
        Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
      </p>
      <div class="notice">
        <strong>Ce lien expire dans 1 heure.</strong>
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      </div>
      <div class="btn-wrap">
        <a href="{{ $resetUrl }}" class="btn">Réinitialiser mon mot de passe</a>
      </div>
      <div class="link-box">
        Ou copiez ce lien dans votre navigateur :<br>{{ $resetUrl }}
      </div>
    </div>
    <div class="footer">
      <p>Développé par <strong>MULTI BRAIN TECH</strong> pour ISI / SUPTECH</p>
      <p>© {{ date('Y') }} ISI / SUPTECH — Dakar, Sénégal</p>
    </div>
  </div>
</div>
</body>
</html>
