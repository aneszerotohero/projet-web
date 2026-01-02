<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "saving" event.
     */
    public function saving(User $user): void
    {
        // For students (role = 'eleve'), matricule should reflect the linked student id
        if (($user->role ?? null) === 'eleve' && ! empty($user->student_id)) {
            // Ensure matricule is the student id as string
            $user->matricule = (string) $user->student_id;
        }
    }
}
