<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\ClasseMatiereProf;
use App\Models\Filiere;
use App\Models\Matiere;
use App\Models\Professeur;
use Illuminate\Database\Seeder;

class TimetableSeeder extends Seeder
{
    private array $profCache    = [];
    private array $classeCache  = [];
    private array $matiereCache = [];

    public function run(): void
    {
        // ── FILIÈRES ─────────────────────────────────────────────────────────
        $filiereData = [
            ['code' => 'FC',   'nom' => 'Finance et Comptabilité',              'couleur' => '#f97316', 'description' => 'Filière Finance et Comptabilité'],
            ['code' => 'IAGE', 'nom' => 'Informatique Appliquée Gestion',       'couleur' => '#3b82f6', 'description' => 'Informatique Appliquée à la Gestion d\'Entreprise'],
            ['code' => 'RI',   'nom' => 'Réseaux Informatiques',                'couleur' => '#06b6d4', 'description' => 'Réseaux Informatiques'],
            ['code' => 'GL',   'nom' => 'Génie Logiciel',                       'couleur' => '#22c55e', 'description' => 'Génie Logiciel'],
            ['code' => 'BT',   'nom' => 'Brevet Technicien Informatique',       'couleur' => '#a855f7', 'description' => 'Brevet Technicien Informatique'],
        ];

        $filiereIds = [];
        foreach ($filiereData as $fd) {
            $f = Filiere::firstOrCreate(
                ['code' => $fd['code']],
                array_merge($fd, ['is_active' => true])
            );
            $filiereIds[$fd['code']] = $f->id;
        }

        // ── CLASSES ───────────────────────────────────────────────────────────
        $classesData = [
            // FC
            ['filiere' => 'FC',   'nom' => 'L1 FC',       'niveau' => 'L1'],
            ['filiere' => 'FC',   'nom' => 'L2 FC',       'niveau' => 'L2'],
            ['filiere' => 'FC',   'nom' => 'L3 FC',       'niveau' => 'L3'],
            // IAGE
            ['filiere' => 'IAGE', 'nom' => 'L1 IAGE',     'niveau' => 'L1'],
            ['filiere' => 'IAGE', 'nom' => 'L2 IAGE',     'niveau' => 'L2'],
            ['filiere' => 'IAGE', 'nom' => 'L3 IAGE',     'niveau' => 'L3'],
            // RI
            ['filiere' => 'RI',   'nom' => 'L1 RI',       'niveau' => 'L1'],
            ['filiere' => 'RI',   'nom' => 'L1 RI SOIR',  'niveau' => 'L1'],
            ['filiere' => 'RI',   'nom' => 'L2 RI',       'niveau' => 'L2'],
            ['filiere' => 'RI',   'nom' => 'L2 RI SOIR',  'niveau' => 'L2'],
            ['filiere' => 'RI',   'nom' => 'L3 RI',       'niveau' => 'L3'],
            ['filiere' => 'RI',   'nom' => 'MASTER 1 RI', 'niveau' => 'M1'],
            ['filiere' => 'RI',   'nom' => 'MASTER 2 RI', 'niveau' => 'M2'],
            // GL
            ['filiere' => 'GL',   'nom' => 'L1 GL',       'niveau' => 'L1'],
            ['filiere' => 'GL',   'nom' => 'L2 GL',       'niveau' => 'L2'],
            // BT
            ['filiere' => 'BT',   'nom' => 'BT1',         'niveau' => 'BT1'],
            ['filiere' => 'BT',   'nom' => 'BT2',         'niveau' => 'BT2'],
            ['filiere' => 'BT',   'nom' => 'BT3',         'niveau' => 'BT3'],
        ];

        foreach ($classesData as $cd) {
            $classe = Classe::firstOrCreate(
                ['nom' => $cd['nom'], 'annee_scolaire' => '2025-2026'],
                [
                    'filiere_id'    => $filiereIds[$cd['filiere']],
                    'niveau'        => $cd['niveau'],
                    'annee_scolaire'=> '2025-2026',
                    'effectif'      => 0,
                    'is_active'     => true,
                ]
            );
            $this->classeCache[$cd['nom']] = $classe->id;
        }

        // ── CMP DATA ─────────────────────────────────────────────────────────
        // Format : 'Classe' => [['Matière', 'email_prof'], ...]
        $cmpData = [

            // ──── L1 FC ────────────────────────────────────────────────────
            'L1 FC' => [
                ['Mathématiques financières de base',         'keita.isi@groupeisi.com'],
                ['Droit civil',                               'mochedieng@gmail.com'],
                ['Économie générale',                         'alioune.fall1@gmail.com'],
                ['Statistiques descriptives',                 'keita.isi@groupeisi.com'],
                ['Travaux d\'inventaire',                     'deme.isi@groupeisi.com'],
                ['Leadership et développement personnel',     'niang.isi@groupeisi.com'],
                ['Communication professionnelle écrite',      'abdoulayesellendoye@gmail.com'],
                ['Introduction à la comptabilité financière', 'deme.isi@groupeisi.com'],
                ['Introduction au management',                'catd41@hotmail.com'],
                ['Anglais',                                   'sanedembis@hotmail.fr'],
            ],

            // ──── L2 FC ────────────────────────────────────────────────────
            'L2 FC' => [
                ['Droit des affaires',                        'mochedieng@gmail.com'],
                ['Comptabilité analytique',                   'alioune.fall1@gmail.com'],
                ['Excel et bureautique',                      'mousfata@gmail.com'],
                ['Management des organisations',              'catd41@hotmail.com'],
                ['Marketing digital',                         'alloucisse411@hotmail.com'],
                ['Anglais',                                   'sanedembis@hotmail.fr'],
                ['Mathématiques générales',                   'malickisidp@groupeisi.com'],
                ['Comptabilité des sociétés',                 'Ibrambengue2501@gmail.com'],
                ['Fiscalité indirecte',                       'aboukhadre@gmail.com'],
                ['Statistiques descriptives',                 'keita.isi@groupeisi.com'],
                ['Financement d\'entreprise',                 'mtoure64@yahoo.fr'],
                ['Économie générale',                         'alioune.fall1@gmail.com'],
                ['Saisie et sainteté comptable',              'alioune.fall1@gmail.com'],
                ['TCTE — Techniques de communication',        'abdoulayesellendoye@gmail.com'],
            ],

            // ──── L3 FC ────────────────────────────────────────────────────
            'L3 FC' => [
                ['Politique financière',                      'alioune.fall1@gmail.com'],
                ['Comptabilité approfondie',                  'deme.isi@groupeisi.com'],
                ['Audit financier',                           'deme.isi@groupeisi.com'],
                ['Contrôle de gestion',                       'bandao.isi@groupeisi.com'],
                ['Pratique fiscale',                          'aboukhadre@gmail.com'],
            ],

            // ──── L1 IAGE ──────────────────────────────────────────────────
            'L1 IAGE' => [
                ['Droit du numérique',                        'mochedieng@gmail.com'],
                ['Architecture des ordinateurs 1',            'hachim.isi@groupeisi.com'],
                ['Leadership et développement personnel',     'niang.isi@groupeisi.com'],
                ['Projet intégré — full stack simple',        'junior.isi@groupeisi.com'],
                ['Analyse 1 et Algèbre 1',                   'lo.mody@ugb.edu.sn'],
                ['Langage C',                                 'ilson91@gmail.com'],
                ['Système d\'exploitation',                   'hassimiyou@yooh.fr'],
                ['Analyses 1 — Mérise',                       'robertdiasse@gmail.com'],
                ['Technologie web 2 — Javascript',            'junior.isi@groupeisi.com'],
                ['Langage Python 2 — POO et database',        'robertdiasse@gmail.com'],
                ['Base de données relationnelle 2 — SQL',     'lo.mody@ugb.edu.sn'],
                ['Fondamentaux des algorithmes',              'ilson91@gmail.com'],
                ['Fondamentaux des réseaux',                  'lqminedabo059@gmail.com'],
                ['Technique d\'expression',                   'abdoulayesellendoye@gmail.com'],
                ['Fondamentaux CCNA',                         'odjigo53@gmail.com'],
                ['Outils de productivité personnelles',       'junior.isi@groupeisi.com'],
            ],

            // ──── L2 IAGE ──────────────────────────────────────────────────
            'L2 IAGE' => [
                ['Programmation fonctionnelle Python',        'lo.mody@ugb.edu.sn'],
                ['Analyse et conception d\'un SI — UML',     'ksamb0701@gmail.com'],
                ['Technologie web — PHP/MySQL',               'lo.mody@ugb.edu.sn'],
                ['SGBD 1 — SQL/PLSQL',                       'ksamb0701@gmail.com'],
                ['Coaching réseaux',                          'alloucisse411@hotmail.com'],
                ['Développement web',                         'akram.isi@groupeisi.com'],
                ['Fondamentaux de l\'IOT',                   'cheickh2502@gmail.com'],
                ['Fondamentaux de l\'IA',                    'junior.isi@groupeisi.com'],
                ['Administration Windows Server',             'lqminedabo059@gmail.com'],
                ['Bases des réseaux',                         'alloucisse411@hotmail.com'],
                ['Téléphonie sur IP',                         'robertdiasse@gmail.com'],
                ['POO C++',                                   'robertdiasse@gmail.com'],
                ['Complexité et algorithmique avancée',       'robertdiasse@gmail.com'],
                ['Administration Linux',                      'lqminedabo059@gmail.com'],
                ['Statistiques probabilités',                 'keita.isi@groupeisi.com'],
                ['Droit des TIC',                             'mochedieng@gmail.com'],
                ['Anglais',                                   'sanedembis@hotmail.fr'],
                ['Théorie des graphes et programmation',      'lo.mody@ugb.edu.sn'],
            ],

            // ──── L3 IAGE ──────────────────────────────────────────────────
            'L3 IAGE' => [
                ['Langage Java avancé',                       'ilson91@gmail.com'],
                ['Développement mobile',                      'papamatar.diop@smartdevafrica.com'],
                ['Développement frontend avancé',             'junior.isi@groupeisi.com'],
                ['MRM — Méthodes de recherche et management', 'abdoulayesellendoye@gmail.com'],
                ['Statistiques avancées',                     'mtoure64@yahoo.fr'],
            ],

            // ──── L1 RI ────────────────────────────────────────────────────
            'L1 RI' => [
                ['Droit du numérique',                        'mochedieng@gmail.com'],
                ['Systèmes d\'exploitation 2',               'khadimewade27@gmail.com'],
                ['Architecture des ordinateurs 1',            'hachim.isi@groupeisi.com'],
                ['Leadership et développement personnel',     'niang.isi@groupeisi.com'],
                ['Projet intégré — full stack simple',        'junior.isi@groupeisi.com'],
                ['Analyse 1 et Algèbre 1',                   'lo.mody@ugb.edu.sn'],
                ['Électronique et maintenance informatique',  'eckgning@yahoo.fr'],
                ['Fondamentaux des algorithmes',              'lqminedabo059@gmail.com'],
                ['Fondamentaux des réseaux',                  'lqminedabo059@gmail.com'],
                ['Analyses 1 — Mérise',                       'robertdiasse@gmail.com'],
                ['Outils numériques et IA générative',        'loshima.isi@groupeisi.com'],
                ['Anglais',                                   'sanedembis@hotmail.fr'],
                ['Langage C',                                 'lo.mody@ugb.edu.sn'],
            ],

            // ──── L1 RI SOIR ───────────────────────────────────────────────
            'L1 RI SOIR' => [
                ['Architecture — Mérise et analyse',          'robertdiasse@gmail.com'],
                ['Analyse 2 — Mérise',                        'djibysec4@gmail.com'],
                ['Technologie web',                           'djibysec4@gmail.com'],
                ['Algorithmique',                             'amoss.isi@groupeisi.com'],
                ['Système d\'exploitation',                   'amoss.isi@groupeisi.com'],
                ['Statistiques descriptives',                 'mtoure64@yahoo.fr'],
            ],

            // ──── L2 RI ────────────────────────────────────────────────────
            'L2 RI' => [
                ['Programmation fonctionnelle Python',        'lo.mody@ugb.edu.sn'],
                ['Analyse et conception d\'un SI — UML',     'ksamb0701@gmail.com'],
                ['Technologie web — PHP/MySQL',               'lo.mody@ugb.edu.sn'],
                ['SGBD 1 — SQL/PLSQL',                       'ksamb0701@gmail.com'],
                ['Coaching réseaux',                          'alloucisse411@hotmail.com'],
                ['Développement web',                         'akram.isi@groupeisi.com'],
                ['Fondamentaux de l\'IOT',                   'cheickh2502@gmail.com'],
                ['Fondamentaux de l\'IA',                    'junior.isi@groupeisi.com'],
                ['Administration Windows Server',             'lqminedabo059@gmail.com'],
                ['Bases des réseaux',                         'alloucisse411@hotmail.com'],
                ['Téléphonie sur IP',                         'robertdiasse@gmail.com'],
                ['POO C++',                                   'robertdiasse@gmail.com'],
                ['Complexité et algorithmique avancée',       'robertdiasse@gmail.com'],
                ['Administration Linux',                      'lqminedabo059@gmail.com'],
                ['Statistiques probabilités',                 'keita.isi@groupeisi.com'],
                ['Droit des TIC',                             'mochedieng@gmail.com'],
                ['Anglais',                                   'sanedembis@hotmail.fr'],
                ['Infrastructure IP et protocoles réseaux',   'malickisidp@groupeisi.com'],
                ['Routage et commutation 2 — CCNP ENARSI',   'khadimewade27@gmail.com'],
            ],

            // ──── L2 RI SOIR ───────────────────────────────────────────────
            'L2 RI SOIR' => [
                ['Technologie web — PHP/Framework',           'djibysec4@gmail.com'],
                ['Programmation Python',                      'alioune.fall1@gmail.com'],
                ['CCNA — Fondamentaux réseaux',              'mdieye@groupeisi.com'],
                ['Analyse UML',                               'robertdiasse@gmail.com'],
                ['Javascript',                                'djibysec4@gmail.com'],
                ['Fondamentaux de la cybersécurité',          'khadidiatousamb@groupeisi.com'],
                ['Administration système Linux',              'abdoul.tahirou@ugb.edu.sn'],
            ],

            // ──── L3 RI ────────────────────────────────────────────────────
            'L3 RI' => [
                ['Fondamentaux de la virtualisation Cloud',   'latyr.isi@groupeisi.com'],
                ['Sécurité système et réseaux',               'abdoul.tahirou@ugb.edu.sn'],
                ['Administration et supervision de services', 'madieng.top@outlook.com'],
                ['GPI — Gestion de projets informatiques',    'abdouwngom@gmail.com'],
                ['IOT — Internet des objets',                 'mtoure64@yahoo.fr'],
            ],

            // ──── MASTER 1 RI ──────────────────────────────────────────────
            'MASTER 1 RI' => [
                ['Administration système avancé 2 (Linux/Windows)', 'abdouwngom@gmail.com'],
                ['Microservices, conteneurisation et orchestration', 'papamatar.diop@smartdevafrica.com'],
                ['Machine learning et deep learning',         'bedadoc@gmail.com'],
                ['Supervision des systèmes et services réseaux', 'latyr.isi@groupeisi.com'],
                ['Communication unifiée avancée — TOIP',      'souare.isi@groupeisi.com'],
                ['Routage et commutation 2 — CCNP ENARSI',   'khadimewade27@gmail.com'],
                ['Gestion de projets informatiques',          'abdoul.tahirou@ugb.edu.sn'],
                ['Entrepreneuriat et leadership',              'abdoulayesellendoye@gmail.com'],
                ['Internet des objets — IOT avancé',          'cheickh2502@gmail.com'],
            ],

            // ──── MASTER 2 RI ──────────────────────────────────────────────
            'MASTER 2 RI' => [
                ['Big Data',                                  'bedadoc@gmail.com'],
                ['Machine Learning avancé',                   'abdoulayebarro9@gmail.com'],
                ['Virtualisation avancée',                    'aw.isi@groupeisi.com'],
                ['Système d\'information géographique',       'aw.isi@groupeisi.com'],
                ['Audit des systèmes d\'information',         'youssoulam@gmail.com'],
                ['Management stratégique',                    'souare.isi@groupeisi.com'],
                ['Qualité de services réseaux — CCNP QoS',   'principe.isi@groupeisi.com'],
                ['Routage et commutation avancée 3 — CCNP',  'principe.isi@groupeisi.com'],
            ],

            // ──── L1 GL ────────────────────────────────────────────────────
            'L1 GL' => [
                ['Droit du numérique',                        'mochedieng@gmail.com'],
                ['Architecture des ordinateurs 1',            'hachim.isi@groupeisi.com'],
                ['Leadership et développement personnel',     'niang.isi@groupeisi.com'],
                ['Projet intégré — full stack simple',        'junior.isi@groupeisi.com'],
                ['Analyse 1 et Algèbre 1',                   'lo.mody@ugb.edu.sn'],
                ['Langage C',                                 'lo.mody@ugb.edu.sn'],
                ['Système d\'exploitation',                   'hassimiyou@yooh.fr'],
                ['Analyses 1 — Mérise',                       'robertdiasse@gmail.com'],
                ['Technologie web 2 — Javascript',            'junior.isi@groupeisi.com'],
                ['Langage Python 2 — POO et database',        'robertdiasse@gmail.com'],
                ['Base de données relationnelle 2 — SQL',     'lo.mody@ugb.edu.sn'],
                ['Fondamentaux des algorithmes',              'ilson91@gmail.com'],
                ['Fondamentaux des réseaux',                  'lqminedabo059@gmail.com'],
                ['Technique d\'expression',                   'abdoulayesellendoye@gmail.com'],
                ['Fondamentaux CCNA',                         'odjigo53@gmail.com'],
                ['Conception et traitement d\'image',         'mousfata@gmail.com'],
                ['Statistiques descriptives',                 'lo.mody@ugb.edu.sn'],
            ],

            // ──── L2 GL ────────────────────────────────────────────────────
            'L2 GL' => [
                ['Programmation fonctionnelle Python',        'lo.mody@ugb.edu.sn'],
                ['Analyse et conception d\'un SI — UML',     'ksamb0701@gmail.com'],
                ['Technologie web — PHP/MySQL',               'lo.mody@ugb.edu.sn'],
                ['SGBD 1 — SQL/PLSQL',                       'ksamb0701@gmail.com'],
                ['Coaching réseaux',                          'alloucisse411@hotmail.com'],
                ['Développement web',                         'akram.isi@groupeisi.com'],
                ['Coaching algorithmique',                    'akram.isi@groupeisi.com'],
                ['Fondamentaux de l\'IA',                    'junior.isi@groupeisi.com'],
                ['Administration Linux',                      'lqminedabo059@gmail.com'],
                ['Téléphonie sur IP',                         'robertdiasse@gmail.com'],
                ['POO C++',                                   'robertdiasse@gmail.com'],
                ['Théorie des graphes et programmation',      'lo.mody@ugb.edu.sn'],
                ['Complexité et algorithmique avancée',       'robertdiasse@gmail.com'],
                ['Bases des réseaux informatiques',           'alloucisse411@hotmail.com'],
                ['Statistiques probabilités',                 'keita.isi@groupeisi.com'],
                ['Droit des TIC',                             'mochedieng@gmail.com'],
                ['Anglais',                                   'sanedembis@hotmail.fr'],
                ['Administration réseaux Windows',            'lqminedabo059@gmail.com'],
                ['Programmation orientée objet Java',         'lo.mody@ugb.edu.sn'],
                ['Content management system',                 'robertdiasse@gmail.com'],
            ],

            // ──── BT1 ──────────────────────────────────────────────────────
            'BT1' => [
                ['OHSSE — Hygiène Sécurité Environnement',   'hassimiyou@yooh.fr'],
                ['Mathématiques',                             'alloucisse411@hotmail.com'],
                ['Assurance du bon fonctionnement d\'un SI', 'alloucisse411@hotmail.com'],
                ['Bureautique',                               'alloucisse411@hotmail.com'],
                ['Mise en service des composants d\'un SI',  'alloucisse411@hotmail.com'],
                ['Assurance de la sécurité de base d\'un SI','alloucisse411@hotmail.com'],
                ['Communication en milieu professionnel',    'alloucisse411@hotmail.com'],
                ['Intégration en milieu professionnel',      'niang.isi@groupeisi.com'],
                ['Leadership et développement personnel',    'niang.isi@groupeisi.com'],
                ['Métier et formation',                      'catd41@hotmail.com'],
                ['Assistance aux utilisateurs',              'alloucisse411@hotmail.com'],
                ['Électronique liée au métier',              'eckgning@yahoo.fr'],
            ],

            // ──── BT2 ──────────────────────────────────────────────────────
            'BT2' => [
                ['OHSSE — Hygiène Sécurité Environnement',   'hassimiyou@yooh.fr'],
                ['Mathématiques',                             'alloucisse411@hotmail.com'],
                ['Assurance du bon fonctionnement d\'un SI', 'alloucisse411@hotmail.com'],
                ['Bureautique',                               'alloucisse411@hotmail.com'],
                ['Mise en service des composants d\'un SI',  'alloucisse411@hotmail.com'],
                ['Assurance de la sécurité de base d\'un SI','alloucisse411@hotmail.com'],
                ['Communication en milieu professionnel',    'niang.isi@groupeisi.com'],
                ['Intégration en milieu professionnel',      'niang.isi@groupeisi.com'],
                ['Leadership et développement personnel',    'niang.isi@groupeisi.com'],
                ['Métier et formation',                      'catd41@hotmail.com'],
                ['Assistance aux utilisateurs',              'alloucisse411@hotmail.com'],
                ['Électronique liée au métier',              'eckgning@yahoo.fr'],
            ],

            // ──── BT3 ──────────────────────────────────────────────────────
            'BT3' => [
                ['OHSSE — Hygiène Sécurité Environnement',   'hassimiyou@yooh.fr'],
                ['Mathématiques',                             'alloucisse411@hotmail.com'],
                ['Assurance du bon fonctionnement d\'un SI', 'alloucisse411@hotmail.com'],
                ['Bureautique',                               'malickisidp@groupeisi.com'],
                ['Mise en service des composants d\'un SI',  'alloucisse411@hotmail.com'],
                ['Assurance de la sécurité de base d\'un SI','alloucisse411@hotmail.com'],
                ['Communication en milieu professionnel',    'niang.isi@groupeisi.com'],
                ['Intégration en milieu professionnel',      'niang.isi@groupeisi.com'],
                ['Leadership et développement personnel',    'niang.isi@groupeisi.com'],
                ['Métier et formation',                      'catd41@hotmail.com'],
                ['Assistance aux utilisateurs',              'alloucisse411@hotmail.com'],
                ['Anglais',                                  'sanedembis@hotmail.fr'],
            ],
        ];

        // ── CRÉER LES CMPs ────────────────────────────────────────────────
        $created = 0;
        $skipped = 0;

        foreach ($cmpData as $classeNom => $entries) {
            $classeId = $this->classeCache[$classeNom] ?? null;
            if (!$classeId) {
                $this->command->warn("Classe introuvable : {$classeNom}");
                continue;
            }

            foreach ($entries as [$matiereNom, $profEmail]) {
                $matiereId = $this->getMatiereId($matiereNom);
                $profId    = $this->getProfId($profEmail);

                if (!$profId) {
                    $this->command->warn("  Prof introuvable ({$profEmail}) → {$classeNom} / {$matiereNom}");
                    $skipped++;
                    continue;
                }

                $exists = ClasseMatiereProf::where([
                    'classe_id'     => $classeId,
                    'matiere_id'    => $matiereId,
                    'professeur_id' => $profId,
                ])->exists();

                if (!$exists) {
                    ClasseMatiereProf::create([
                        'classe_id'      => $classeId,
                        'matiere_id'     => $matiereId,
                        'professeur_id'  => $profId,
                        'annee_scolaire' => '2025-2026',
                        'is_active'      => true,
                    ]);
                    $created++;
                }
            }
        }

        $this->command->info("TimetableSeeder terminé : {$created} CMP créées, {$skipped} ignorées.");
    }

    private function getMatiereId(string $nom): int
    {
        if (isset($this->matiereCache[$nom])) {
            return $this->matiereCache[$nom];
        }
        $m = Matiere::firstOrCreate(['nom' => $nom], [
            'code'      => $this->makeCode($nom),
            'is_active' => true,
        ]);
        $this->matiereCache[$nom] = $m->id;
        return $m->id;
    }

    private function makeCode(string $nom): string
    {
        $map = [
            'é'=>'e','è'=>'e','ê'=>'e','ë'=>'e','à'=>'a','â'=>'a','ä'=>'a',
            'ù'=>'u','û'=>'u','ü'=>'u','î'=>'i','ï'=>'i','ô'=>'o','ö'=>'o',
            'ç'=>'c','É'=>'E','È'=>'E','Ê'=>'E','À'=>'A','Â'=>'A','Î'=>'I',
            'Ô'=>'O','Ù'=>'U','Û'=>'U','œ'=>'oe','æ'=>'ae',
        ];
        $clean = strtr($nom, $map);
        $clean = preg_replace('/[^A-Za-z0-9\s]/', '', $clean);
        $clean = preg_replace('/\s+/', '_', trim($clean));
        return strtoupper(substr($clean, 0, 30));
    }

    private function getProfId(string $email): ?int
    {
        $key = strtolower($email);
        if (isset($this->profCache[$key])) {
            return $this->profCache[$key];
        }
        $p = Professeur::whereRaw('LOWER(email) = ?', [$key])->first();
        if ($p) {
            $this->profCache[$key] = $p->id;
            return $p->id;
        }
        return null;
    }
}
