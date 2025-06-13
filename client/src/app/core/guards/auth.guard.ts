import { inject } from '@angular/core';
import { Router } from '@angular/router';

export function authGuard() {
  const router = inject(Router);

  // Check if the user is logged in
  const isLoggedIn = localStorage.getItem('token') !== null;

  if (!isLoggedIn) {
    // Redirect to the login page
    router.navigate(['/login']);
    return false;
  }

  return true;
}
