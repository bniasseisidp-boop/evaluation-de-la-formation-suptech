<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\EmailRapportController;
use App\Models\Parametre;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendProfRapports extends Command
{
    protected $signature   = 'emails:send-prof-rapports {--force : Envoyer même si déjà envoyé ou date non atteinte}';
    protected $description = 'Envoie les rapports aux professeurs si la date planifiée est atteinte (une seule fois)';

    public function handle(): int
    {
        if (!$this->option('force')) {
            $scheduled = Parametre::get('email_rapport_scheduled_at');

            if (!$scheduled) {
                $this->info('Aucune date planifiée.');
                return 0;
            }

            // Pas encore la date prévue
            if (Carbon::parse($scheduled)->isFuture()) {
                $this->info('Planifié pour le ' . Carbon::parse($scheduled)->format('d/m/Y H:i') . '. Pas encore le moment.');
                return 0;
            }

            // Déjà envoyé après la date planifiée → ne pas rienvoyer
            $lastSent = Parametre::get('email_rapport_last_sent_at');
            if ($lastSent && Carbon::parse($lastSent)->isAfter(Carbon::parse($scheduled)->subMinute())) {
                $this->info('Les rapports ont déjà été envoyés pour ce planning (le ' . Carbon::parse($lastSent)->format('d/m/Y H:i') . ').');
                return 0;
            }
        }

        $this->info('Envoi des rapports en cours...');

        $controller = app(EmailRapportController::class);
        $sent       = $controller->sendAllRapports($this->option('force'));

        Parametre::set('email_rapport_last_sent_at', now()->toDateTimeString());

        $this->info("{$sent} email(s) envoyé(s) avec succès.");
        return 0;
    }
}
