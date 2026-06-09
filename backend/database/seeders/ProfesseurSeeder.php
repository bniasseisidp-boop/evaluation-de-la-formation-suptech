<?php

namespace Database\Seeders;

use App\Models\Professeur;
use Illuminate\Database\Seeder;

class ProfesseurSeeder extends Seeder
{
    public function run()
    {
        $profs = [
            ['prenom' => 'KHADIME',                'nom' => 'WADE',        'email' => 'khadimewade27@gmail.com',                  'specialite' => 'ALGO, LANGAGE C',              'grade' => 'MASTER'],
            ['prenom' => 'ALIOUNE',                'nom' => 'FALL',        'email' => 'alioune.fall1@gmail.com',                  'specialite' => 'COMPTABILITE',                 'grade' => 'MASTER'],
            ['prenom' => 'MOUSTAPHA',              'nom' => 'DIOP',        'email' => 'mousfata@gmail.com',                       'specialite' => 'PHOTOSHOP',                    'grade' => 'MASTER'],
            ['prenom' => 'IBRA',                   'nom' => 'MBENGUE',     'email' => 'Ibrambengue2501@gmail.com',                'specialite' => 'COMPTABILITE DES SOCIETES',    'grade' => 'MASTER'],
            ['prenom' => 'ALANSSANE',              'nom' => 'CISSE',       'email' => 'alloucisse411@hotmail.com',                'specialite' => 'MARKETING',                    'grade' => 'MASTER'],
            ['prenom' => 'DEMBA',                  'nom' => 'SANE',        'email' => 'sanedembis@hotmail.fr',                    'specialite' => 'ANGLAIS',                      'grade' => 'MASTER'],
            ['prenom' => 'EL HADJI DJIBY SALIF',   'nom' => 'SECK',        'email' => 'djibysec4@gmail.com',                      'specialite' => 'DEVELOPPEMENT WEB',            'grade' => 'MASTER'],
            ['prenom' => 'BAKARY',                 'nom' => 'DIATTA',      'email' => 'diattabacary85@gmail.com',                 'specialite' => 'ANGLAIS',                      'grade' => 'MASTER'],
            ['prenom' => 'SERIGNE MODOU KARA',     'nom' => 'SAMB',        'email' => 'ksamb0701@gmail.com',                      'specialite' => 'SGBD, UML',                    'grade' => 'MASTER'],
            ['prenom' => 'CHEICK AHMATH',          'nom' => 'NDIAYE',      'email' => 'cheickh2502@gmail.com',                    'specialite' => 'IOT',                          'grade' => 'MASTER'],
            ['prenom' => 'ABDOU WORE',             'nom' => 'NGOM',        'email' => 'abdouwngom@gmail.com',                     'specialite' => 'RESEAUX',                      'grade' => 'MASTER'],
            ['prenom' => 'LAMINE ROBERT',          'nom' => 'DIASSE',      'email' => 'robertdiasse@gmail.com',                   'specialite' => 'PHP, ANALYSE SGF',             'grade' => 'LICENCE'],
            ['prenom' => 'IBRAHIMA',               'nom' => 'LO',          'email' => 'ilson91@gmail.com',                        'specialite' => 'JAVA, C++',                    'grade' => 'MASTER'],
            ['prenom' => 'MALLE',                  'nom' => 'NDIAYE',      'email' => 'mallebtic@gmail.com',                      'specialite' => 'ORACLE',                       'grade' => 'MASTER'],
            ['prenom' => 'SERIGNE FALLOU',         'nom' => 'NDIAYE',      'email' => 'serignefallou2@gmail.com',                 'specialite' => 'ARCHITECTURE',                 'grade' => 'MASTER'],
            ['prenom' => 'ABDOULAYE SELLE',        'nom' => 'NDOYE',       'email' => 'abdoulayesellendoye@gmail.com',            'specialite' => 'TC, TE',                       'grade' => 'MASTER'],
            ['prenom' => 'SOULEYMANE',             'nom' => 'HAROUNA',     'email' => 'harouna23@gmail.com',                      'specialite' => 'ALGO, LANGAGE C',              'grade' => 'MASTER'],
            ['prenom' => 'MOUSSA GAYE',            'nom' => 'DIEYE',       'email' => 'mdieye@groupeisi.com',                     'specialite' => 'BUREAUTIQUE, IT ESSENTIAL',    'grade' => 'MASTER'],
            ['prenom' => 'ABDOUL KARIM',           'nom' => 'TAHIROU',     'email' => 'abdoul.tahirou@ugb.edu.sn',                'specialite' => 'THEORIE RESEAUX',              'grade' => 'MASTER'],
            ['prenom' => 'MBAYE SOKHNA',           'nom' => 'THIAM',       'email' => 'thiam.mbayesokhna@gmail.com',              'specialite' => 'ALGO, LANGAGE',                'grade' => 'MASTER'],
            ['prenom' => 'GOUMYANDE',              'nom' => 'NDOYE',       'email' => 'amagoumba2102@yahoo.fr',                   'specialite' => 'COMPTABILITE DES SOCIETES',    'grade' => 'MASTER'],
            ['prenom' => 'MADIENG',                'nom' => 'TOP',         'email' => 'madieng.top@outlook.com',                  'specialite' => 'MATHS FINES',                  'grade' => 'MASTER'],
            ['prenom' => 'OUSMANE SECK',           'nom' => 'GNING',       'email' => 'eckgning@yahoo.fr',                        'specialite' => 'ELECTRONIQUE',                 'grade' => 'MASTER'],
            ['prenom' => 'MOUSSEBOURY CHEICKH',    'nom' => 'DIENG',       'email' => 'mochedieng@gmail.com',                     'specialite' => 'DROIT',                        'grade' => 'MASTER'],
            ['prenom' => 'MAMADOU L',              'nom' => 'DABO',        'email' => 'lqminedabo059@gmail.com',                  'specialite' => 'SE, LINUX, RESEAUX',           'grade' => 'MASTER'],
            ['prenom' => 'ARMEL',                  'nom' => 'GERAUD',      'email' => 'agmadji@gmail.com',                        'specialite' => 'ORACLE',                       'grade' => 'MASTER'],
            ['prenom' => 'M. ABDOUKHADRE',         'nom' => 'DIAGNE',      'email' => 'diagnea@gmail.com',                        'specialite' => 'GPI',                          'grade' => 'DESS/MASTER'],
            ['prenom' => 'CHEIKH TIDIANE',         'nom' => 'DIAW',        'email' => 'catd41@hotmail.com',                       'specialite' => 'OE',                           'grade' => 'MASTER'],
            ['prenom' => 'ABDOU KHADRE',           'nom' => 'SYLLAME',     'email' => 'aboukhadre@gmail.com',                     'specialite' => 'PRATIQUE FISCALE',             'grade' => 'DOCTEUR'],
            ['prenom' => 'KOMLAN',                 'nom' => 'BEDA',        'email' => 'bedadoc@gmail.com',                        'specialite' => 'INTELLIGENCE ARTIFICIELLE',    'grade' => 'DOCTEUR'],
            ['prenom' => 'MODY',                   'nom' => 'LO',          'email' => 'lo.mody@ugb.edu.sn',                       'specialite' => 'PROGRAMMATION LINEAIRE',       'grade' => 'DOCTEUR'],
            ['prenom' => 'OUMAR',                  'nom' => 'DJIGO',       'email' => 'odjigo53@gmail.com',                       'specialite' => 'MANAGEMENT STRATEGIQUE',       'grade' => 'DOCTEUR'],
            ['prenom' => 'MOUSTAPHA',              'nom' => 'SENE',        'email' => 'killamo5@gmail.com',                       'specialite' => 'ITIL',                         'grade' => 'MASTER'],
            ['prenom' => 'PAPA MATAR',             'nom' => 'DIOP',        'email' => 'papamatar.diop@smartdevafrica.com',         'specialite' => 'DEVELOPPEMENT MOBILE',         'grade' => 'MASTER'],
            ['prenom' => 'HASSIMIYOU',             'nom' => 'DIALLO',      'email' => 'hassimiyou@yooh.fr',                       'specialite' => 'QHSE',                         'grade' => 'MASTER'],
            ['prenom' => 'NDIAGA MATAR',           'nom' => 'FALL',        'email' => 'ndiagamatarfall97@gmail.com',              'specialite' => 'JAVA, TW WEB',                 'grade' => 'MASTER'],
            ['prenom' => 'BABACAR',                'nom' => 'DIOP',        'email' => 'babacardiop@groupeisi.com',                'specialite' => 'ADMIN WINDOWS',                'grade' => 'MASTER'],
            ['prenom' => 'MOUSA',                  'nom' => 'WADE',        'email' => 'moisawade@gmail.com',                      'specialite' => 'DEBOWS',                       'grade' => 'INGENIEUR'],
            ['prenom' => 'ODILON RANSARD',         'nom' => 'IKOUNDALA',   'email' => '1ssoudalaor@gmail.com',                    'specialite' => 'ODOO',                         'grade' => 'MASTER'],
            ['prenom' => 'MALICK',                 'nom' => 'SAMB',        'email' => 'malickisidp@groupeisi.com',                'specialite' => 'INFRASTRUCTURE NUMERIQUE',     'grade' => 'MASTER'],
            ['prenom' => 'YOUSSOUPHA',             'nom' => 'LAM',         'email' => 'youssoulam@gmail.com',                     'specialite' => 'AUDIT SYSTEME INFORMATION',    'grade' => 'MASTER'],
            ['prenom' => 'ABDOULAYE',              'nom' => 'BARRO',       'email' => 'abdoulayebarro9@gmail.com',                'specialite' => 'MACHINE LEARNING',             'grade' => 'MASTER'],
            ['prenom' => 'MAMADOU',                'nom' => 'TOURE',       'email' => 'mtoure64@yahoo.fr',                        'specialite' => 'STATISTIQUE',                  'grade' => 'MASTER'],
            ['prenom' => 'KHADIDIATOU',            'nom' => 'SAMB',        'email' => 'khadidiatousamb@groupeisi.com',            'specialite' => 'CYBER SECURITE',               'grade' => 'MASTER'],
            // Professeurs supplémentaires identifiés dans les emplois du temps
            ['prenom' => 'MOUSTAPHA',              'nom' => 'NIANG',       'email' => 'niang.isi@groupeisi.com',                  'specialite' => 'LEADERSHIP, DEVELOPPEMENT PERSONNEL', 'grade' => 'MASTER'],
            ['prenom' => 'MAMADOU',                'nom' => 'KEITA',       'email' => 'keita.isi@groupeisi.com',                  'specialite' => 'MATHEMATIQUES, STATISTIQUES',         'grade' => 'MASTER'],
            ['prenom' => 'BOUBACAR',               'nom' => 'DEME',        'email' => 'deme.isi@groupeisi.com',                   'specialite' => 'COMPTABILITE FINANCIERE',             'grade' => 'MASTER'],
            ['prenom' => 'MOUSSA',                 'nom' => 'HACHIM',      'email' => 'hachim.isi@groupeisi.com',                 'specialite' => 'ARCHITECTURE ORDINATEURS',            'grade' => 'MASTER'],
            ['prenom' => 'IBOU',                   'nom' => 'JUNIOR',      'email' => 'junior.isi@groupeisi.com',                 'specialite' => 'DEVELOPPEMENT WEB, PROJET INTEGRE',  'grade' => 'MASTER'],
            ['prenom' => 'AHMAD',                  'nom' => 'AKRAM',       'email' => 'akram.isi@groupeisi.com',                  'specialite' => 'DEVELOPPEMENT WEB, COACHING ALGO',   'grade' => 'MASTER'],
            ['prenom' => 'DR',                     'nom' => 'LATYR',       'email' => 'latyr.isi@groupeisi.com',                  'specialite' => 'SUPERVISION SYSTEMES, CLOUD',        'grade' => 'DOCTEUR'],
            ['prenom' => 'MAMADOU',                'nom' => 'SOUARE',      'email' => 'souare.isi@groupeisi.com',                 'specialite' => 'TOIP, MANAGEMENT',                   'grade' => 'MASTER'],
            ['prenom' => 'JEAN',                   'nom' => 'PRINCIPE',    'email' => 'principe.isi@groupeisi.com',               'specialite' => 'RESEAUX AVANCES, CCNP',              'grade' => 'MASTER'],
            ['prenom' => 'IBRAHIMA',               'nom' => 'AW',          'email' => 'aw.isi@groupeisi.com',                     'specialite' => 'VIRTUALISATION, SIG',                'grade' => 'MASTER'],
            ['prenom' => 'OUMAR',                  'nom' => 'AMOSS',       'email' => 'amoss.isi@groupeisi.com',                  'specialite' => 'ALGORITHMIQUE, RESEAUX',              'grade' => 'MASTER'],
            ['prenom' => 'JEAN',                   'nom' => 'BA NDAO',     'email' => 'bandao.isi@groupeisi.com',                 'specialite' => 'CONTROLE DE GESTION',                'grade' => 'MASTER'],
            ['prenom' => 'ADAMA',                  'nom' => 'LOSHIMA',     'email' => 'loshima.isi@groupeisi.com',                'specialite' => 'OUTILS NUMERIQUES IA GENERATIVE',    'grade' => 'MASTER'],
        ];

        foreach ($profs as $prof) {
            Professeur::updateOrCreate(
                ['email' => strtolower($prof['email'])],
                array_merge($prof, ['is_active' => true])
            );
        }

        $this->command->info('57 professeurs importés avec succès.');
    }
}
