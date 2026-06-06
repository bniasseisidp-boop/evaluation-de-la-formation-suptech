<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\ClasseMatiereProf;
use App\Models\Filiere;
use App\Models\Matiere;
use App\Models\Professeur;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run()
    {
        // Admin user
        User::updateOrCreate(
            ['email' => 'admin@isi-suptech.sn'],
            [
                'name'      => 'Administrateur ISI',
                'password'  => Hash::make('Admin@2025'),
                'role'      => 'admin',
                'is_active' => true,
            ]
        );

        // Sample filieres
        $gl = Filiere::firstOrCreate(['code' => 'GL'], [
            'nom'         => 'Génie Logiciel',
            'description' => 'Formation en développement logiciel',
            'couleur'     => '#1E3A8A',
        ]);
        $iage = Filiere::firstOrCreate(['code' => 'IAGE'], [
            'nom'         => 'Intelligence Artificielle & Génie des Données',
            'description' => 'IA, Big Data et analyse de données',
            'couleur'     => '#7C3AED',
        ]);
        $ri = Filiere::firstOrCreate(['code' => 'RI'], [
            'nom'         => 'Réseaux & Informatique',
            'description' => 'Réseaux, sécurité et systèmes',
            'couleur'     => '#059669',
        ]);
        $bt = Filiere::firstOrCreate(['code' => 'BT'], [
            'nom'         => 'Brevet de Technicien',
            'description' => 'Formation BT Informatique',
            'couleur'     => '#DC2626',
        ]);

        // GL Classes
        foreach (['L1','L2','L3'] as $niveau) {
            Classe::firstOrCreate(
                ['filiere_id' => $gl->id, 'niveau' => $niveau, 'annee_scolaire' => '2025-2026'],
                ['nom' => "GL $niveau", 'effectif' => 30]
            );
        }
        foreach (['M1','M2'] as $niveau) {
            Classe::firstOrCreate(
                ['filiere_id' => $gl->id, 'niveau' => $niveau, 'annee_scolaire' => '2025-2026'],
                ['nom' => "GL $niveau", 'effectif' => 20]
            );
        }

        // IAGE Classes
        foreach (['L1','L2','L3'] as $niveau) {
            Classe::firstOrCreate(
                ['filiere_id' => $iage->id, 'niveau' => $niveau, 'annee_scolaire' => '2025-2026'],
                ['nom' => "IAGE $niveau", 'effectif' => 25]
            );
        }

        // RI Classes
        foreach (['L1','L2','L3'] as $niveau) {
            Classe::firstOrCreate(
                ['filiere_id' => $ri->id, 'niveau' => $niveau, 'annee_scolaire' => '2025-2026'],
                ['nom' => "RI $niveau", 'effectif' => 28]
            );
        }

        // BT Classes
        foreach (['BT1','BT2','BT3'] as $niveau) {
            Classe::firstOrCreate(
                ['filiere_id' => $bt->id, 'niveau' => $niveau, 'annee_scolaire' => '2025-2026'],
                ['nom' => "BT Informatique $niveau", 'effectif' => 35]
            );
        }

        // Sample Matieres
        $matieres = [
            ['nom' => 'C Sharp', 'code' => 'CSHARP'],
            ['nom' => 'Langage Java', 'code' => 'JAVA'],
            ['nom' => 'Base de Données Oracle', 'code' => 'BD_ORACLE'],
            ['nom' => 'Gestion de Projet Informatique', 'code' => 'GPI'],
            ['nom' => 'Technologies Web', 'code' => 'TW'],
            ['nom' => 'Design et Ergonomie', 'code' => 'DESIGN'],
            ['nom' => 'Algorithmes et Structures de Données', 'code' => 'ALGO'],
            ['nom' => 'Réseaux Informatiques', 'code' => 'RESEAU'],
            ['nom' => 'Mathématiques', 'code' => 'MATHS'],
        ];
        foreach ($matieres as $m) {
            Matiere::firstOrCreate(['code' => $m['code']], ['nom' => $m['nom']]);
        }

        // Sample Professeurs
        $profs = [
            ['nom' => 'LO', 'prenom' => 'M', 'specialite' => 'C Sharp, Java'],
            ['nom' => 'BEDA', 'prenom' => 'M', 'specialite' => 'Base de données'],
            ['nom' => 'DIAGNE', 'prenom' => 'M', 'specialite' => 'GPI'],
            ['nom' => 'SECK', 'prenom' => 'M', 'specialite' => 'Technologies Web'],
            ['nom' => 'THIAM', 'prenom' => 'M', 'specialite' => 'Design et Ergonomie'],
        ];
        foreach ($profs as $p) {
            Professeur::firstOrCreate(['nom' => $p['nom'], 'prenom' => $p['prenom']], $p);
        }
    }
}
