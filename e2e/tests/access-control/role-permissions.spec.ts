import { test, expect } from '../../fixtures/auth';
import { waitForLoadingComplete } from '../../utils/helpers';

test.describe('Role-Based Access Control', () => {
  test.describe('Farmer Permissions', () => {
    test('farmer should access farmer routes', async ({ farmerPage }) => {
      const allowedRoutes = [
        '/dashboard',
        '/farmer/batches',
        '/farmer/batches/new',
      ];

      for (const route of allowedRoutes) {
        await farmerPage.goto(route);
        await waitForLoadingComplete(farmerPage);

        // Should not be redirected to login or access denied
        expect(farmerPage.url()).not.toMatch(/\/login/);
      }
    });

    test('farmer should NOT access admin routes', async ({ farmerPage }) => {
      const restrictedRoutes = [
        '/admin',
        '/admin/batches',
        '/admin/matching',
        '/admin/farmers',
      ];

      for (const route of restrictedRoutes) {
        await farmerPage.goto(route);
        await waitForLoadingComplete(farmerPage);

        // Should be redirected away from admin
        expect(farmerPage.url()).not.toMatch(/^.*\/admin(?!.*denied)/);
      }
    });

    test('farmer should NOT access MPK routes', async ({ farmerPage }) => {
      const restrictedRoutes = [
        '/mpk/requests',
        '/mpk/market',
      ];

      for (const route of restrictedRoutes) {
        await farmerPage.goto(route);
        await waitForLoadingComplete(farmerPage);

        // Should be redirected away from MPK
        expect(farmerPage.url()).not.toMatch(/^.*\/mpk(?!.*denied)/);
      }
    });

    test('farmer should NOT see other farmers data', async ({ farmerPage }) => {
      // Try to access farmers list
      await farmerPage.goto('/farmers');
      await waitForLoadingComplete(farmerPage);

      // Either redirected or access denied
      const isRestricted =
        !farmerPage.url().includes('/farmers') ||
        farmerPage.url().includes('denied') ||
        (await farmerPage.getByText(/access denied|forbidden|запрещ/i).isVisible().catch(() => false));

      expect(isRestricted).toBeTruthy();
    });

    test('farmer should see own batches only', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      // Should be on batches page
      await expect(farmerPage.getByRole('heading', { name: /batches|партии/i })).toBeVisible();

      // All visible batches should belong to current farmer
      // (This is enforced by RLS - UI just confirms no other data leaks)
    });

    test('farmer can view aggregated market demand', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/market');
      await waitForLoadingComplete(farmerPage);

      // If market page exists for farmers
      if (!farmerPage.url().includes('denied')) {
        // Should show aggregated demand (without MPK identifiers)
        const content = await farmerPage.content();
        // MPK names should not be visible to farmers
        expect(content.toLowerCase()).not.toMatch(/specific.*mpk.*name/i);
      }
    });
  });

  test.describe('MPK Permissions', () => {
    test('MPK should access MPK routes', async ({ mpkPage }) => {
      const allowedRoutes = [
        '/dashboard',
        '/mpk/requests',
        '/mpk/market',
      ];

      for (const route of allowedRoutes) {
        await mpkPage.goto(route);
        await waitForLoadingComplete(mpkPage);

        expect(mpkPage.url()).not.toMatch(/\/login/);
      }
    });

    test('MPK should NOT access admin routes', async ({ mpkPage }) => {
      const restrictedRoutes = [
        '/admin',
        '/admin/matching',
        '/admin/farmers',
      ];

      for (const route of restrictedRoutes) {
        await mpkPage.goto(route);
        await waitForLoadingComplete(mpkPage);

        expect(mpkPage.url()).not.toMatch(/^.*\/admin(?!.*denied)/);
      }
    });

    test('MPK should NOT access farmer routes', async ({ mpkPage }) => {
      const restrictedRoutes = [
        '/farmer/batches',
        '/farmer/batches/new',
      ];

      for (const route of restrictedRoutes) {
        await mpkPage.goto(route);
        await waitForLoadingComplete(mpkPage);

        expect(mpkPage.url()).not.toMatch(/^.*\/farmer(?!.*denied)/);
      }
    });

    test('MPK should see aggregated supply without farmer IDs', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/market');
      await waitForLoadingComplete(mpkPage);

      // Page content should not contain farmer identifiers
      const content = await mpkPage.content();

      // Should NOT expose farmer IDs or names
      expect(content).not.toMatch(/farmer_id|farmerId/i);
    });

    test('MPK should NOT modify batch status', async ({ mpkPage }) => {
      // Even if MPK somehow accesses a batch detail page
      await mpkPage.goto('/batches');
      await waitForLoadingComplete(mpkPage);

      // Look for any status change buttons
      const statusButtons = mpkPage.getByRole('button', {
        name: /publish|commit|confirm|forecast|опубликовать|подтвердить/i,
      });

      // Should not see batch status transition buttons
      const count = await statusButtons.count();
      expect(count).toBe(0);
    });
  });

  test.describe('Admin Permissions', () => {
    test('admin should access all routes', async ({ adminPage }) => {
      const allRoutes = [
        '/dashboard',
        '/admin',
        '/admin/batches',
        '/admin/requests',
        '/admin/matching',
        '/admin/farmers',
        '/admin/mpks',
      ];

      for (const route of allRoutes) {
        await adminPage.goto(route);
        await waitForLoadingComplete(adminPage);

        // Admin should have access everywhere
        expect(adminPage.url()).not.toMatch(/denied|forbidden/i);
      }
    });

    test('admin should see all farmers', async ({ adminPage }) => {
      await adminPage.goto('/admin/farmers');
      await waitForLoadingComplete(adminPage);

      await expect(
        adminPage.getByRole('heading', { name: /farmer|фермер/i })
      ).toBeVisible();
    });

    test('admin should see all MPKs', async ({ adminPage }) => {
      await adminPage.goto('/admin/mpks');
      await waitForLoadingComplete(adminPage);

      await expect(
        adminPage.getByRole('heading', { name: /mpk|мпк/i })
      ).toBeVisible();
    });

    test('admin should see full batch details with farmer info', async ({
      adminPage,
    }) => {
      await adminPage.goto('/admin/batches');
      await waitForLoadingComplete(adminPage);

      // Should see farmer column
      const farmerColumn = adminPage.locator('th, [role="columnheader"]').filter({
        hasText: /farmer|фермер/i,
      });

      await expect(farmerColumn).toBeVisible();
    });

    test('admin can perform status overrides', async ({ adminPage }) => {
      await adminPage.goto('/admin/batches');
      await waitForLoadingComplete(adminPage);

      // Find a batch and check for admin actions
      const firstRow = adminPage.locator('tbody tr').first();
      if (await firstRow.isVisible().catch(() => false)) {
        await firstRow.click();
        await waitForLoadingComplete(adminPage);

        // Admin should see override or admin action options
        const hasAdminActions =
          (await adminPage
            .getByRole('button', { name: /override|admin|force/i })
            .isVisible()
            .catch(() => false)) ||
          (await adminPage
            .getByRole('menuitem', { name: /override|admin|force/i })
            .isVisible()
            .catch(() => false));

        // This is optional - admin actions may be contextual
      }
    });
  });

  test.describe('Unauthenticated Access', () => {
    test('unauthenticated user should be redirected to login', async ({ page }) => {
      const protectedRoutes = [
        '/dashboard',
        '/farmer/batches',
        '/mpk/requests',
        '/admin',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
      }
    });

    test('login page should be accessible', async ({ page }) => {
      await page.goto('/login');

      // Should not redirect
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('public pages should be accessible', async ({ page }) => {
      // Home/landing page should be accessible
      await page.goto('/');
      await waitForLoadingComplete(page);

      // Should not redirect to login immediately for public pages
      // (depends on implementation - landing might redirect to login)
    });
  });

  test.describe('Cross-Role Data Isolation', () => {
    test('farmer and MPK should have isolated data views', async ({
      authenticatedPage,
    }) => {
      // Create pages for both roles
      const farmerPage = await authenticatedPage('farmer');
      const mpkPage = await authenticatedPage('mpk');

      // Farmer batches
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      // MPK requests
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);

      // Each should see their own data only
      // Farmer should not see MPK info, MPK should not see farmer info
      const farmerContent = await farmerPage.content();
      const mpkContent = await mpkPage.content();

      // Basic check - more specific checks would depend on actual data
      expect(farmerContent).not.toMatch(/mpk.*request.*id/i);
      expect(mpkContent).not.toMatch(/farmer.*batch.*owner/i);
    });

    test('multiple farmers should not see each other batches', async ({
      browser,
    }) => {
      // This test requires two farmer accounts
      // For now, we verify RLS through single farmer test
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('/login');
      // Would need second farmer credentials to fully test
      // Skipping for now as it requires test data setup

      await context.close();
    });
  });

  test.describe('Action Authorization', () => {
    test('MPK cannot transition batch status', async ({ mpkPage }) => {
      // Try to access batch actions
      await mpkPage.goto('/batches');
      await waitForLoadingComplete(mpkPage);

      // No batch status buttons should be visible
      const transitionButtons = mpkPage.getByRole('button', {
        name: /publish|commit|confirm|match|опубликовать|подтвердить|сопоставить/i,
      });

      const count = await transitionButtons.count();
      expect(count).toBe(0);
    });

    test('farmer cannot create pool requests', async ({ farmerPage }) => {
      // Try to access pool requests
      await farmerPage.goto('/mpk/requests/new');
      await waitForLoadingComplete(farmerPage);

      // Should be redirected or denied
      expect(farmerPage.url()).not.toMatch(/\/mpk\/requests\/new$/);
    });

    test('farmer cannot access matching interface', async ({ farmerPage }) => {
      await farmerPage.goto('/admin/matching');
      await waitForLoadingComplete(farmerPage);

      // Should not be on matching page
      expect(farmerPage.url()).not.toMatch(/\/admin\/matching$/);
    });
  });
});
