<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\ClasseMatiereProfController;
use App\Http\Controllers\Api\EvaluationEnseignementController;
use App\Http\Controllers\Api\EvaluationFormationController;
use App\Http\Controllers\Api\EvaluationQualiteController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\FiliereController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\ProfesseurController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/invitation/{token}', [AuthController::class, 'checkInvitation']);
Route::get('/filieres/public', [FiliereController::class, 'index']);
Route::get('/classes/public', [ClasseController::class, 'index']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Student dashboard
    Route::get('/student/dashboard', [StudentController::class, 'dashboard']);
    Route::get('/student/my-evaluations/enseignement', [EvaluationEnseignementController::class, 'myEvaluations']);
    Route::get('/student/my-evaluations/qualite', [EvaluationQualiteController::class, 'myEvaluation']);
    Route::get('/student/my-evaluations/formation', [EvaluationFormationController::class, 'myEvaluations']);

    // Evaluations (students submit)
    Route::post('/evaluations/enseignement', [EvaluationEnseignementController::class, 'store']);
    Route::post('/evaluations/qualite', [EvaluationQualiteController::class, 'store']);
    Route::post('/evaluations/formation', [EvaluationFormationController::class, 'store']);

    // Public data for forms (classes, matières, profs)
    Route::get('/filieres', [FiliereController::class, 'index']);
    Route::get('/classes', [ClasseController::class, 'index']);
    Route::get('/matieres', [MatiereController::class, 'index']);
    Route::get('/professeurs', [ProfesseurController::class, 'index']);
    Route::get('/cmp', [ClasseMatiereProfController::class, 'index']);
    Route::get('/cmp/classe/{classeId}', [EvaluationEnseignementController::class, 'classeGrid']);

    // Admin only routes
    Route::middleware('admin')->group(function () {

        // Dashboard
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/admin/reports/filiere/{id}', [AdminController::class, 'filiereReport']);
        Route::get('/admin/reports/classe/{id}', [AdminController::class, 'classeReport']);

        // Students management
        Route::get('/admin/students', [StudentController::class, 'index']);
        Route::get('/admin/students/{user}', [StudentController::class, 'show']);
        Route::delete('/admin/students/{user}', [StudentController::class, 'destroy']);

        // Invitations
        Route::get('/invitations', [InvitationController::class, 'index']);
        Route::post('/invitations', [InvitationController::class, 'store']);
        Route::post('/invitations/bulk', [InvitationController::class, 'bulkInvite']);
        Route::post('/invitations/{invitation}/resend', [InvitationController::class, 'resend']);
        Route::delete('/invitations/{invitation}', [InvitationController::class, 'destroy']);

        // Filieres CRUD
        Route::post('/filieres', [FiliereController::class, 'store']);
        Route::get('/filieres/{filiere}', [FiliereController::class, 'show']);
        Route::put('/filieres/{filiere}', [FiliereController::class, 'update']);
        Route::delete('/filieres/{filiere}', [FiliereController::class, 'destroy']);

        // Classes CRUD
        Route::post('/classes', [ClasseController::class, 'store']);
        Route::get('/classes/{classe}', [ClasseController::class, 'show']);
        Route::put('/classes/{classe}', [ClasseController::class, 'update']);
        Route::delete('/classes/{classe}', [ClasseController::class, 'destroy']);

        // Professeurs CRUD
        Route::post('/professeurs', [ProfesseurController::class, 'store']);
        Route::get('/professeurs/{professeur}', [ProfesseurController::class, 'show']);
        Route::put('/professeurs/{professeur}', [ProfesseurController::class, 'update']);
        Route::delete('/professeurs/{professeur}', [ProfesseurController::class, 'destroy']);

        // Matieres CRUD
        Route::post('/matieres', [MatiereController::class, 'store']);
        Route::get('/matieres/{matiere}', [MatiereController::class, 'show']);
        Route::put('/matieres/{matiere}', [MatiereController::class, 'update']);
        Route::delete('/matieres/{matiere}', [MatiereController::class, 'destroy']);

        // Classe-Matiere-Prof associations
        Route::post('/cmp', [ClasseMatiereProfController::class, 'store']);
        Route::delete('/cmp/{classeMatiereProfesseur}', [ClasseMatiereProfController::class, 'destroy']);

        // All evaluations (admin view)
        Route::get('/evaluations/enseignement', [EvaluationEnseignementController::class, 'index']);
        Route::get('/evaluations/enseignement/{evaluationEnseignement}', [EvaluationEnseignementController::class, 'show']);
        Route::get('/evaluations/qualite', [EvaluationQualiteController::class, 'index']);
        Route::get('/evaluations/qualite/stats', [EvaluationQualiteController::class, 'globalStats']);
        Route::get('/evaluations/formation', [EvaluationFormationController::class, 'index']);
        Route::get('/evaluations/formation/stats', [EvaluationFormationController::class, 'globalStats']);

        // Admin users management
        Route::get('/admin/admins', [AdminUserController::class, 'index']);
        Route::post('/admin/admins', [AdminUserController::class, 'store']);
        Route::put('/admin/admins/{user}', [AdminUserController::class, 'update']);
        Route::delete('/admin/admins/{user}', [AdminUserController::class, 'destroy']);

        // PDF Exports
        Route::get('/export/filiere/{id}', [ExportController::class, 'exportFiliere']);
        Route::get('/export/classe/{id}', [ExportController::class, 'exportClasse']);

        // Réinitialisation annuelle
        Route::delete('/admin/reset-evals', [AdminController::class, 'resetEvals']);
    });
});
