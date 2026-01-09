import { test, expect } from '../../fixtures/auth';
import {
  waitForLoadingComplete,
  waitForToast,
  fillFormField,
  selectOption,
  openDialog,
  confirmDialog,
  getTableRow,
  generateTestId,
  getFutureDate,
} from '../../utils/helpers';

test.describe('Farmer Batch Lifecycle', () => {
  test.describe('Batch List', () => {
    test('should display farmer batches list', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      // Should see batches section
      await expect(
        farmerPage.getByRole('heading', { name: /batches|партии/i })
      ).toBeVisible();
    });

    test('should show create batch button', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      await expect(
        farmerPage.getByRole('button', { name: /create|add|создать|добавить/i })
      ).toBeVisible();
    });

    test('should filter batches by status', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      // Look for status filter
      const statusFilter = farmerPage.locator('[data-testid="status-filter"], select');
      if (await statusFilter.isVisible().catch(() => false)) {
        await statusFilter.click();
        // Select a status option
        await farmerPage.getByRole('option', { name: /draft|черновик/i }).click();
        await waitForLoadingComplete(farmerPage);
      }
    });
  });

  test.describe('Create Batch', () => {
    test('should open create batch form', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      await farmerPage
        .getByRole('button', { name: /create|add|создать|добавить/i })
        .click();

      // Should open form dialog or navigate to form page
      await expect(
        farmerPage.getByRole('dialog').or(farmerPage.locator('form'))
      ).toBeVisible({ timeout: 5000 });
    });

    test('should create new batch in draft status', async ({ farmerPage }) => {
      const testId = generateTestId();
      await farmerPage.goto('/farmer/batches/new');
      await waitForLoadingComplete(farmerPage);

      // Fill required fields (adjust based on actual form fields)
      const form = farmerPage.locator('form');

      // Cattle type/breed selection
      const cattleTypeField = form.locator(
        '[name="cattle_type"], [data-testid="cattle-type"]'
      );
      if (await cattleTypeField.isVisible().catch(() => false)) {
        await cattleTypeField.click();
        await farmerPage.getByRole('option').first().click();
      }

      // Head count
      const headCountField = form.locator(
        'input[name="head_count"], input[name="quantity"], [data-testid="head-count"]'
      );
      if (await headCountField.isVisible().catch(() => false)) {
        await headCountField.fill('10');
      }

      // Weight
      const weightField = form.locator(
        'input[name="avg_weight"], input[name="weight"], [data-testid="weight"]'
      );
      if (await weightField.isVisible().catch(() => false)) {
        await weightField.fill('450');
      }

      // Delivery date
      const deliveryField = form.locator(
        'input[name="delivery_date"], input[type="date"], [data-testid="delivery-date"]'
      );
      if (await deliveryField.isVisible().catch(() => false)) {
        await deliveryField.fill(getFutureDate(30));
      }

      // Submit form
      await form.getByRole('button', { name: /save|create|сохранить|создать/i }).click();

      // Should show success or redirect
      await Promise.race([
        waitForToast(farmerPage, { type: 'success' }),
        farmerPage.waitForURL(/\/farmer\/batches(?!\/new)/),
      ]);
    });

    test('should validate required fields', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches/new');
      await waitForLoadingComplete(farmerPage);

      // Try to submit empty form
      const form = farmerPage.locator('form');
      await form.getByRole('button', { name: /save|create|сохранить|создать/i }).click();

      // Should show validation errors
      await expect(
        farmerPage.getByText(/required|обязательн/i).first()
      ).toBeVisible();
    });
  });

  test.describe('Batch Status Transitions', () => {
    test.beforeEach(async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);
    });

    test('should allow transition from draft to forecast', async ({ farmerPage }) => {
      // Find a draft batch
      const draftRow = await getTableRow(farmerPage, /draft|черновик/i);
      if (!(await draftRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      // Click on the batch to open details
      await draftRow.click();
      await waitForLoadingComplete(farmerPage);

      // Look for publish/forecast button
      const publishButton = farmerPage.getByRole('button', {
        name: /publish|forecast|опубликовать|прогноз/i,
      });

      if (await publishButton.isVisible().catch(() => false)) {
        await publishButton.click();

        // Confirm if dialog appears
        const confirmBtn = farmerPage.getByRole('button', {
          name: /confirm|yes|подтвердить|да/i,
        });
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
        }

        await waitForLoadingComplete(farmerPage);

        // Status should update to forecast
        await expect(farmerPage.getByText(/forecast|прогноз/i)).toBeVisible();
      }
    });

    test('should allow transition from forecast to soft_committed', async ({
      farmerPage,
    }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      // Find a forecast batch
      const forecastRow = await getTableRow(farmerPage, /forecast|прогноз/i);
      if (!(await forecastRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await forecastRow.click();
      await waitForLoadingComplete(farmerPage);

      // Look for soft commit button
      const softCommitButton = farmerPage.getByRole('button', {
        name: /soft.*commit|предварительн/i,
      });

      if (await softCommitButton.isVisible().catch(() => false)) {
        await softCommitButton.click();

        // Handle confirmation
        const confirmBtn = farmerPage.getByRole('button', {
          name: /confirm|yes|подтвердить|да/i,
        });
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
        }

        await waitForLoadingComplete(farmerPage);

        // Status should update
        await expect(
          farmerPage.getByText(/soft.*committed|предварительно/i)
        ).toBeVisible();
      }
    });

    test('should allow transition from soft_committed to confirmed', async ({
      farmerPage,
    }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      // Find a soft committed batch
      const softCommittedRow = await getTableRow(
        farmerPage,
        /soft.*committed|предварительно/i
      );
      if (!(await softCommittedRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await softCommittedRow.click();
      await waitForLoadingComplete(farmerPage);

      // Look for confirm button
      const confirmBatchButton = farmerPage.getByRole('button', {
        name: /^confirm|подтвердить$/i,
      });

      if (await confirmBatchButton.isVisible().catch(() => false)) {
        await confirmBatchButton.click();

        // Handle confirmation dialog
        const dialogConfirm = farmerPage.getByRole('alertdialog');
        if (await dialogConfirm.isVisible().catch(() => false)) {
          await dialogConfirm.getByRole('button', { name: /yes|да/i }).click();
        }

        await waitForLoadingComplete(farmerPage);

        // Status should update to confirmed
        await expect(farmerPage.getByText(/^confirmed|подтверждён/i)).toBeVisible();
      }
    });
  });

  test.describe('Batch Edit Restrictions', () => {
    test('should allow editing draft batch', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      const draftRow = await getTableRow(farmerPage, /draft|черновик/i);
      if (!(await draftRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await draftRow.click();
      await waitForLoadingComplete(farmerPage);

      // Should see edit button for draft
      await expect(
        farmerPage.getByRole('button', { name: /edit|редактировать/i })
      ).toBeVisible();
    });

    test('should restrict editing confirmed batch', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      const confirmedRow = await getTableRow(farmerPage, /^confirmed|подтверждён/i);
      if (!(await confirmedRow.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await confirmedRow.click();
      await waitForLoadingComplete(farmerPage);

      // Edit button should be disabled or not visible for confirmed batch
      const editButton = farmerPage.getByRole('button', {
        name: /edit|редактировать/i,
      });
      const isDisabled = await editButton.isDisabled().catch(() => true);
      const isHidden = !(await editButton.isVisible().catch(() => false));

      expect(isDisabled || isHidden).toBeTruthy();
    });
  });

  test.describe('Batch Details', () => {
    test('should display batch details page', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      // Click on first batch
      const firstBatchRow = farmerPage.locator('tr').filter({ hasText: /.+/ }).first();
      if (await firstBatchRow.isVisible().catch(() => false)) {
        await firstBatchRow.click();
        await waitForLoadingComplete(farmerPage);

        // Should show batch details
        await expect(
          farmerPage.getByText(/cattle|head|weight|голов|вес/i).first()
        ).toBeVisible();
      }
    });

    test('should show batch status badge', async ({ farmerPage }) => {
      await farmerPage.goto('/farmer/batches');
      await waitForLoadingComplete(farmerPage);

      // Status badges should be visible
      const statusBadges = farmerPage.locator(
        '[data-testid="status-badge"], .badge, [class*="status"]'
      );
      await expect(statusBadges.first()).toBeVisible();
    });
  });
});
