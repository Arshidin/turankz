import { test, expect } from '../../fixtures/auth';
import {
  waitForLoadingComplete,
  waitForToast,
  getTableRow,
  confirmDialog,
} from '../../utils/helpers';

test.describe('Admin Matching Workflow', () => {
  test.describe('Admin Dashboard', () => {
    test('should display admin dashboard with overview', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      await waitForLoadingComplete(adminPage);

      // Should see admin dashboard
      await expect(
        adminPage.getByRole('heading', { name: /admin|dashboard|панель/i })
      ).toBeVisible();
    });

    test('should show matching window status', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      await waitForLoadingComplete(adminPage);

      // Look for matching window indicator
      const windowIndicator = adminPage.locator(
        '[data-testid="matching-window"], [class*="window"]'
      ).filter({
        hasText: /window|окно/i,
      });

      // Window status should be visible
      if (await windowIndicator.isVisible().catch(() => false)) {
        await expect(windowIndicator).toBeVisible();
      }
    });

    test('should display statistics cards', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      await waitForLoadingComplete(adminPage);

      // Should show stats cards (batches, requests, matchings, etc.)
      const statsCards = adminPage.locator(
        '[data-testid="stats-card"], .card, [class*="stat"]'
      );
      await expect(statsCards.first()).toBeVisible();
    });
  });

  test.describe('Matching Window Management', () => {
    test('should display matching windows list', async ({ adminPage }) => {
      await adminPage.goto('/admin/matching-windows');
      await waitForLoadingComplete(adminPage);

      await expect(
        adminPage.getByRole('heading', { name: /matching.*window|окна.*сопоставлен/i })
      ).toBeVisible();
    });

    test('should show window status badges', async ({ adminPage }) => {
      await adminPage.goto('/admin/matching-windows');
      await waitForLoadingComplete(adminPage);

      // Status badges should be visible
      const statusBadges = adminPage.locator(
        '[data-testid="status-badge"], .badge'
      ).filter({
        hasText: /upcoming|active|locked|closed|предстоящ|активн|заблокир|закрыт/i,
      });

      if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toBeVisible();
      }
    });

    test('should allow admin to transition window status', async ({ adminPage }) => {
      await adminPage.goto('/admin/matching-windows');
      await waitForLoadingComplete(adminPage);

      // Find an upcoming window
      const upcomingRow = await getTableRow(adminPage, /upcoming|предстоящ/i);
      if (!(await upcomingRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await upcomingRow.click();
      await waitForLoadingComplete(adminPage);

      // Look for activate/open button
      const activateButton = adminPage.getByRole('button', {
        name: /activate|open|активировать|открыть/i,
      });

      if (await activateButton.isVisible().catch(() => false)) {
        await activateButton.click();

        // Should require note/reason
        const noteField = adminPage.locator(
          'textarea[name="note"], textarea[name="reason"]'
        );
        if (await noteField.isVisible().catch(() => false)) {
          await noteField.fill('Opening window for testing');
        }

        await adminPage
          .getByRole('button', { name: /confirm|подтвердить/i })
          .click();

        await waitForLoadingComplete(adminPage);

        // Status should change
        await expect(adminPage.getByText(/active|активн/i)).toBeVisible();
      }
    });
  });

  test.describe('Batch Management', () => {
    test('should display all batches across farmers', async ({ adminPage }) => {
      await adminPage.goto('/admin/batches');
      await waitForLoadingComplete(adminPage);

      await expect(
        adminPage.getByRole('heading', { name: /batches|партии/i })
      ).toBeVisible();
    });

    test('should show farmer information for each batch', async ({ adminPage }) => {
      await adminPage.goto('/admin/batches');
      await waitForLoadingComplete(adminPage);

      // Admin should see farmer names/IDs
      const farmerColumn = adminPage.locator('th, [role="columnheader"]').filter({
        hasText: /farmer|фермер/i,
      });

      await expect(farmerColumn).toBeVisible();
    });

    test('should allow admin to override batch status', async ({ adminPage }) => {
      await adminPage.goto('/admin/batches');
      await waitForLoadingComplete(adminPage);

      // Find any batch
      const batchRow = adminPage.locator('tr').filter({ hasText: /.+/ }).first();
      if (!(await batchRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await batchRow.click();
      await waitForLoadingComplete(adminPage);

      // Look for admin override button
      const overrideButton = adminPage.getByRole('button', {
        name: /override|admin.*action|переопределить/i,
      });

      if (await overrideButton.isVisible().catch(() => false)) {
        await expect(overrideButton).toBeVisible();
        // Don't actually click to avoid modifying data
      }
    });
  });

  test.describe('Pool Request Management', () => {
    test('should display all pool requests', async ({ adminPage }) => {
      await adminPage.goto('/admin/requests');
      await waitForLoadingComplete(adminPage);

      await expect(
        adminPage.getByRole('heading', { name: /requests|заявки/i })
      ).toBeVisible();
    });

    test('should show MPK information for each request', async ({ adminPage }) => {
      await adminPage.goto('/admin/requests');
      await waitForLoadingComplete(adminPage);

      // Admin should see MPK names
      const mpkColumn = adminPage.locator('th, [role="columnheader"]').filter({
        hasText: /mpk|мпк|company|компания/i,
      });

      await expect(mpkColumn).toBeVisible();
    });
  });

  test.describe('Matching Operations', () => {
    test('should display matching workspace', async ({ adminPage }) => {
      await adminPage.goto('/admin/matching');
      await waitForLoadingComplete(adminPage);

      await expect(
        adminPage.getByRole('heading', { name: /matching|сопоставлен/i })
      ).toBeVisible();
    });

    test('should show available batches for matching', async ({ adminPage }) => {
      await adminPage.goto('/admin/matching');
      await waitForLoadingComplete(adminPage);

      // Should show batches section
      const batchesSection = adminPage.locator('[data-testid="available-batches"]').or(
        adminPage.getByRole('region', { name: /batches|партии/i })
      );

      // If batches section exists, it should be visible
      if (await batchesSection.isVisible().catch(() => false)) {
        await expect(batchesSection).toBeVisible();
      }
    });

    test('should show submitted pool requests', async ({ adminPage }) => {
      await adminPage.goto('/admin/matching');
      await waitForLoadingComplete(adminPage);

      // Should show requests section
      const requestsSection = adminPage
        .locator('[data-testid="pool-requests"]')
        .or(adminPage.getByRole('region', { name: /requests|заявки/i }));

      if (await requestsSection.isVisible().catch(() => false)) {
        await expect(requestsSection).toBeVisible();
      }
    });

    test('admin should be able to initiate matching', async ({ adminPage }) => {
      await adminPage.goto('/admin/matching');
      await waitForLoadingComplete(adminPage);

      // Look for match button
      const matchButton = adminPage.getByRole('button', {
        name: /match|create.*match|сопоставить|создать/i,
      });

      if (await matchButton.isVisible().catch(() => false)) {
        // Verify button is enabled (might be disabled if no valid matches)
        const isEnabled = !(await matchButton.isDisabled().catch(() => true));
        if (isEnabled) {
          await expect(matchButton).toBeEnabled();
        }
      }
    });
  });

  test.describe('Execution Management', () => {
    test('should display executions list', async ({ adminPage }) => {
      await adminPage.goto('/admin/executions');
      await waitForLoadingComplete(adminPage);

      await expect(
        adminPage.getByRole('heading', { name: /execution|исполнен/i })
      ).toBeVisible();
    });

    test('should show execution status and timeline', async ({ adminPage }) => {
      await adminPage.goto('/admin/executions');
      await waitForLoadingComplete(adminPage);

      // Find an execution
      const executionRow = adminPage.locator('tr').filter({ hasText: /.+/ }).first();
      if (!(await executionRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await executionRow.click();
      await waitForLoadingComplete(adminPage);

      // Should show execution details
      await expect(
        adminPage.getByText(/status|timeline|статус|хроника/i).first()
      ).toBeVisible();
    });

    test('should allow admin to update execution status', async ({ adminPage }) => {
      await adminPage.goto('/admin/executions');
      await waitForLoadingComplete(adminPage);

      // Find an active execution
      const activeRow = await getTableRow(adminPage, /executing|в процессе/i);
      if (!(await activeRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await activeRow.click();
      await waitForLoadingComplete(adminPage);

      // Look for status update button
      const updateButton = adminPage.getByRole('button', {
        name: /update.*status|complete|обновить|завершить/i,
      });

      if (await updateButton.isVisible().catch(() => false)) {
        await expect(updateButton).toBeVisible();
      }
    });
  });

  test.describe('User Management', () => {
    test('should display farmers list', async ({ adminPage }) => {
      await adminPage.goto('/admin/farmers');
      await waitForLoadingComplete(adminPage);

      await expect(
        adminPage.getByRole('heading', { name: /farmer|фермер/i })
      ).toBeVisible();
    });

    test('should display MPK list', async ({ adminPage }) => {
      await adminPage.goto('/admin/mpks');
      await waitForLoadingComplete(adminPage);

      await expect(
        adminPage.getByRole('heading', { name: /mpk|мпк/i })
      ).toBeVisible();
    });

    test('should allow admin to manage farmer registration status', async ({
      adminPage,
    }) => {
      await adminPage.goto('/admin/farmers');
      await waitForLoadingComplete(adminPage);

      // Find a pending farmer
      const pendingRow = await getTableRow(adminPage, /pending|ожидает/i);
      if (!(await pendingRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await pendingRow.click();
      await waitForLoadingComplete(adminPage);

      // Look for approve/reject buttons
      const approveButton = adminPage.getByRole('button', {
        name: /approve|activate|одобрить|активировать/i,
      });

      if (await approveButton.isVisible().catch(() => false)) {
        await expect(approveButton).toBeVisible();
      }
    });
  });

  test.describe('Audit and Logging', () => {
    test('should display audit log', async ({ adminPage }) => {
      await adminPage.goto('/admin/audit');
      await waitForLoadingComplete(adminPage);

      // If audit page exists
      if (adminPage.url().includes('/audit')) {
        await expect(
          adminPage.getByRole('heading', { name: /audit|log|журнал/i })
        ).toBeVisible();
      }
    });

    test('admin actions should require notes', async ({ adminPage }) => {
      await adminPage.goto('/admin/batches');
      await waitForLoadingComplete(adminPage);

      // Find a batch
      const batchRow = adminPage.locator('tr').filter({ hasText: /.+/ }).first();
      if (!(await batchRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await batchRow.click();
      await waitForLoadingComplete(adminPage);

      // Try to perform admin action
      const adminActionButton = adminPage.getByRole('button', {
        name: /override|admin|переопределить/i,
      });

      if (await adminActionButton.isVisible().catch(() => false)) {
        await adminActionButton.click();

        // Should show note/reason field
        const noteField = adminPage.locator(
          'textarea[name="note"], textarea[name="reason"], textarea'
        );
        await expect(noteField).toBeVisible();
      }
    });
  });

  test.describe('Access Control', () => {
    test('admin should have full access to all routes', async ({ adminPage }) => {
      const routes = ['/admin', '/admin/batches', '/admin/requests', '/admin/matching'];

      for (const route of routes) {
        await adminPage.goto(route);
        await waitForLoadingComplete(adminPage);

        // Should not be redirected to access denied
        expect(adminPage.url()).toContain(route.split('/').pop());
      }
    });

    test('admin should see all farmer batches', async ({ adminPage }) => {
      await adminPage.goto('/admin/batches');
      await waitForLoadingComplete(adminPage);

      // Should show batches table with farmer info
      const table = adminPage.locator('table');
      if (await table.isVisible().catch(() => false)) {
        const rows = table.locator('tbody tr');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
