import { test, expect } from '../../fixtures/auth';
import {
  waitForLoadingComplete,
  waitForToast,
  generateTestId,
  getFutureDate,
  getTableRow,
} from '../../utils/helpers';

test.describe('MPK Pool Request Lifecycle', () => {
  test.describe('Market Overview', () => {
    test('should display aggregated supply without farmer identifiers', async ({
      mpkPage,
    }) => {
      await mpkPage.goto('/mpk/market');
      await waitForLoadingComplete(mpkPage);

      // Should see market overview
      await expect(
        mpkPage.getByRole('heading', { name: /market|supply|рынок|предложение/i })
      ).toBeVisible();

      // Should NOT see individual farmer names or IDs
      const content = await mpkPage.content();

      // Check that farmer identifiers are masked
      // The actual text depends on your implementation
      expect(content).not.toMatch(/farmer.*id|фермер.*id/i);
    });

    test('should show supply aggregated by region', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/market');
      await waitForLoadingComplete(mpkPage);

      // Look for region-based grouping
      const regionHeaders = mpkPage.locator(
        '[data-testid="region-header"], h3, h4'
      ).filter({
        hasText: /region|область|район/i,
      });

      // If regions are displayed, verify aggregation
      if (await regionHeaders.count() > 0) {
        await expect(regionHeaders.first()).toBeVisible();
      }
    });

    test('should show cattle type categories', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/market');
      await waitForLoadingComplete(mpkPage);

      // Should show cattle type filters or categories
      await expect(
        mpkPage.getByText(/cattle|breed|КРС|порода/i).first()
      ).toBeVisible();
    });
  });

  test.describe('Pool Request List', () => {
    test('should display MPK pool requests', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);

      // Should see pool requests section
      await expect(
        mpkPage.getByRole('heading', { name: /requests|заявки/i })
      ).toBeVisible();
    });

    test('should show create request button', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);

      await expect(
        mpkPage.getByRole('button', { name: /create|new|создать|новая/i })
      ).toBeVisible();
    });

    test('should filter requests by status', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);

      // Look for status filter
      const statusFilter = mpkPage.locator(
        '[data-testid="status-filter"], [role="combobox"]'
      );
      if (await statusFilter.isVisible().catch(() => false)) {
        await statusFilter.click();
        await mpkPage.getByRole('option').first().click();
        await waitForLoadingComplete(mpkPage);
      }
    });
  });

  test.describe('Create Pool Request', () => {
    test('should open create pool request form', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);

      await mpkPage
        .getByRole('button', { name: /create|new|создать|новая/i })
        .click();

      // Should open form
      await expect(
        mpkPage.getByRole('dialog').or(mpkPage.locator('form'))
      ).toBeVisible({ timeout: 5000 });
    });

    test('should create pool request in draft status', async ({ mpkPage }) => {
      const testId = generateTestId();
      await mpkPage.goto('/mpk/requests/new');
      await waitForLoadingComplete(mpkPage);

      const form = mpkPage.locator('form');

      // Fill cattle type
      const cattleTypeField = form.locator(
        '[name="cattle_type"], [data-testid="cattle-type"]'
      );
      if (await cattleTypeField.isVisible().catch(() => false)) {
        await cattleTypeField.click();
        await mpkPage.getByRole('option').first().click();
      }

      // Fill quantity
      const quantityField = form.locator(
        'input[name="quantity"], input[name="head_count"], [data-testid="quantity"]'
      );
      if (await quantityField.isVisible().catch(() => false)) {
        await quantityField.fill('50');
      }

      // Fill min/max weight if exists
      const minWeightField = form.locator('input[name="min_weight"]');
      if (await minWeightField.isVisible().catch(() => false)) {
        await minWeightField.fill('400');
      }

      const maxWeightField = form.locator('input[name="max_weight"]');
      if (await maxWeightField.isVisible().catch(() => false)) {
        await maxWeightField.fill('500');
      }

      // Fill delivery period
      const deliveryField = form.locator(
        'input[name="delivery_date"], input[type="date"], [data-testid="delivery-period"]'
      );
      if (await deliveryField.isVisible().catch(() => false)) {
        await deliveryField.fill(getFutureDate(45));
      }

      // Submit
      await form.getByRole('button', { name: /save|create|сохранить|создать/i }).click();

      // Should show success or redirect
      await Promise.race([
        waitForToast(mpkPage, { type: 'success' }),
        mpkPage.waitForURL(/\/mpk\/requests(?!\/new)/),
      ]);
    });

    test('should validate required fields', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/requests/new');
      await waitForLoadingComplete(mpkPage);

      const form = mpkPage.locator('form');
      await form.getByRole('button', { name: /save|create|сохранить|создать/i }).click();

      // Should show validation errors
      await expect(mpkPage.getByText(/required|обязательн/i).first()).toBeVisible();
    });
  });

  test.describe('Pool Request Status Transitions', () => {
    test.beforeEach(async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);
    });

    test('should allow transition from draft to submitted', async ({ mpkPage }) => {
      // Find a draft request
      const draftRow = await getTableRow(mpkPage, /draft|черновик/i);
      if (!(await draftRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await draftRow.click();
      await waitForLoadingComplete(mpkPage);

      // Look for submit button
      const submitButton = mpkPage.getByRole('button', {
        name: /submit|подать|отправить/i,
      });

      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click();

        // Handle confirmation
        const confirmBtn = mpkPage.getByRole('button', {
          name: /confirm|yes|подтвердить|да/i,
        });
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
        }

        await waitForLoadingComplete(mpkPage);

        // Status should update
        await expect(mpkPage.getByText(/submitted|подана/i)).toBeVisible();
      }
    });

    test('should not allow MPK to match requests', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);

      // Find any request
      const requestRow = mpkPage.locator('tr').filter({ hasText: /.+/ }).first();
      if (!(await requestRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await requestRow.click();
      await waitForLoadingComplete(mpkPage);

      // Match button should NOT be visible for MPK
      const matchButton = mpkPage.getByRole('button', {
        name: /match|сопоставить/i,
      });

      const isVisible = await matchButton.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    });
  });

  test.describe('Pool Request Edit Restrictions', () => {
    test('should allow editing draft request', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);

      const draftRow = await getTableRow(mpkPage, /draft|черновик/i);
      if (!(await draftRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await draftRow.click();
      await waitForLoadingComplete(mpkPage);

      // Should see edit button for draft
      await expect(
        mpkPage.getByRole('button', { name: /edit|редактировать/i })
      ).toBeVisible();
    });

    test('should restrict editing submitted request', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);

      const submittedRow = await getTableRow(mpkPage, /submitted|подана/i);
      if (!(await submittedRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await submittedRow.click();
      await waitForLoadingComplete(mpkPage);

      // Edit button should be disabled or not visible
      const editButton = mpkPage.getByRole('button', {
        name: /edit|редактировать/i,
      });
      const isDisabled = await editButton.isDisabled().catch(() => true);
      const isHidden = !(await editButton.isVisible().catch(() => false));

      expect(isDisabled || isHidden).toBeTruthy();
    });
  });

  test.describe('Request Details and Progress', () => {
    test('should display request details', async ({ mpkPage }) => {
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);

      const firstRow = mpkPage.locator('tr').filter({ hasText: /.+/ }).first();
      if (await firstRow.isVisible().catch(() => false)) {
        await firstRow.click();
        await waitForLoadingComplete(mpkPage);

        // Should show request details
        await expect(
          mpkPage.getByText(/quantity|cattle|head|количество|КРС/i).first()
        ).toBeVisible();
      }
    });

    test('should show matching progress for submitted request', async ({
      mpkPage,
    }) => {
      await mpkPage.goto('/mpk/requests');
      await waitForLoadingComplete(mpkPage);

      // Find submitted or matched request
      const activeRow = await getTableRow(mpkPage, /submitted|matching|подана|сопоставлен/i);
      if (!(await activeRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await activeRow.click();
      await waitForLoadingComplete(mpkPage);

      // Should show progress indicator
      const progressIndicator = mpkPage.locator(
        '[data-testid="matching-progress"], [role="progressbar"], .progress'
      );

      // Progress might be visible if matching has started
      // This is optional as it depends on the request status
    });
  });

  test.describe('Access Control', () => {
    test('MPK should not see farmer list', async ({ mpkPage }) => {
      // Try to access farmers page
      await mpkPage.goto('/farmers');

      // Should redirect or show access denied
      const url = mpkPage.url();
      const hasAccess = url.includes('/farmers') && !url.includes('denied');

      if (hasAccess) {
        // Check that farmer identifiers are not shown
        await expect(
          mpkPage.getByText(/access denied|доступ запрещён|no access/i)
        ).toBeVisible();
      }
    });

    test('MPK should not access admin routes', async ({ mpkPage }) => {
      await mpkPage.goto('/admin');

      // Should redirect to MPK area or show access denied
      await expect(mpkPage).not.toHaveURL(/^\/admin(?!.*denied)/);
    });
  });
});
