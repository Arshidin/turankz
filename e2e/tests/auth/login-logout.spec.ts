import { test, expect, TEST_USERS } from '../../fixtures/auth';
import { waitForLoadingComplete, waitForToast } from '../../utils/helpers';

test.describe('Authentication Flow', () => {
  test.describe('Login', () => {
    test('should show login page with form', async ({ page }) => {
      await page.goto('/login');

      // Check login form elements exist
      await expect(page.getByRole('heading', { name: /login|вход/i })).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in|войти/i })).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');

      // Submit empty form
      await page.getByRole('button', { name: /sign in|войти/i }).click();

      // Should show validation errors
      await expect(page.getByText(/email.*required|email.*обязательн/i)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.getByRole('button', { name: /sign in|войти/i }).click();

      // Wait for error message
      await expect(page.getByText(/invalid|incorrect|неверн/i)).toBeVisible({
        timeout: 10000,
      });
    });

    test('should redirect to login when accessing protected route unauthenticated', async ({
      page,
    }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should login as farmer and redirect to farmer dashboard', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"]', TEST_USERS.farmer.email);
      await page.fill('input[type="password"]', TEST_USERS.farmer.password);
      await page.getByRole('button', { name: /sign in|войти/i }).click();

      // Should redirect to farmer area
      await expect(page).toHaveURL(/\/(dashboard|farmer)/, { timeout: 15000 });
      await waitForLoadingComplete(page);
    });

    test('should login as MPK and redirect to MPK dashboard', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"]', TEST_USERS.mpk.email);
      await page.fill('input[type="password"]', TEST_USERS.mpk.password);
      await page.getByRole('button', { name: /sign in|войти/i }).click();

      // Should redirect to MPK area
      await expect(page).toHaveURL(/\/(dashboard|mpk)/, { timeout: 15000 });
      await waitForLoadingComplete(page);
    });

    test('should login as admin and redirect to admin dashboard', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"]', TEST_USERS.admin.email);
      await page.fill('input[type="password"]', TEST_USERS.admin.password);
      await page.getByRole('button', { name: /sign in|войти/i }).click();

      // Should redirect to admin area
      await expect(page).toHaveURL(/\/(dashboard|admin)/, { timeout: 15000 });
      await waitForLoadingComplete(page);
    });
  });

  test.describe('Logout', () => {
    test('farmer should be able to logout', async ({ farmerPage }) => {
      // Find and click logout button (usually in user menu)
      const userMenu = farmerPage.locator('[data-testid="user-menu"], [aria-label*="user"]');
      if (await userMenu.isVisible().catch(() => false)) {
        await userMenu.click();
      }

      // Click logout
      await farmerPage.getByRole('button', { name: /logout|sign out|выйти/i }).click();

      // Should redirect to login or home
      await expect(farmerPage).toHaveURL(/\/(login|$)/, { timeout: 10000 });
    });

    test('session should be cleared after logout', async ({ farmerPage }) => {
      // Logout
      const userMenu = farmerPage.locator('[data-testid="user-menu"], [aria-label*="user"]');
      if (await userMenu.isVisible().catch(() => false)) {
        await userMenu.click();
      }
      await farmerPage.getByRole('button', { name: /logout|sign out|выйти/i }).click();

      // Wait for redirect
      await farmerPage.waitForURL(/\/(login|$)/);

      // Try to access protected route
      await farmerPage.goto('/dashboard');

      // Should be redirected to login
      await expect(farmerPage).toHaveURL(/\/login/);
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session after page refresh', async ({ farmerPage }) => {
      const currentUrl = farmerPage.url();

      // Refresh page
      await farmerPage.reload();
      await waitForLoadingComplete(farmerPage);

      // Should still be authenticated (not redirected to login)
      await expect(farmerPage).not.toHaveURL(/\/login/);
    });
  });

  test.describe('Password Reset', () => {
    test('should show forgot password link', async ({ page }) => {
      await page.goto('/login');

      // Check for forgot password link
      const forgotLink = page.getByRole('link', { name: /forgot|забыл/i });
      await expect(forgotLink).toBeVisible();
    });

    test.skip('should send password reset email', async ({ page }) => {
      // This test requires email verification - skip in automated tests
      await page.goto('/login');
      await page.getByRole('link', { name: /forgot|забыл/i }).click();

      await page.fill('input[type="email"]', 'test@example.com');
      await page.getByRole('button', { name: /send|отправить/i }).click();

      await waitForToast(page, { type: 'success' });
    });
  });
});
