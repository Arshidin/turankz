import { Page, Locator, expect } from '@playwright/test';

/**
 * Wait for loading states to complete
 */
export async function waitForLoadingComplete(page: Page): Promise<void> {
  // Wait for any loading spinners to disappear
  const loadingIndicators = [
    '[data-testid="loading"]',
    '.animate-spin',
    '[aria-busy="true"]',
    '.loading',
  ];

  for (const selector of loadingIndicators) {
    const element = page.locator(selector).first();
    if (await element.isVisible().catch(() => false)) {
      await element.waitFor({ state: 'hidden', timeout: 30000 });
    }
  }
}

/**
 * Wait for toast notification
 */
export async function waitForToast(
  page: Page,
  options?: { type?: 'success' | 'error' | 'warning'; text?: string }
): Promise<void> {
  const toastSelector = '[data-sonner-toast]';
  await page.waitForSelector(toastSelector, { state: 'visible', timeout: 10000 });

  if (options?.text) {
    await expect(page.locator(toastSelector)).toContainText(options.text);
  }
}

/**
 * Fill form field by label
 */
export async function fillFormField(
  page: Page,
  label: string,
  value: string
): Promise<void> {
  const field = page.getByLabel(label);
  await field.click();
  await field.fill(value);
}

/**
 * Select option in a select/combobox
 */
export async function selectOption(
  page: Page,
  label: string,
  optionText: string
): Promise<void> {
  // Click on the select trigger
  await page.getByLabel(label).click();

  // Wait for dropdown to open
  await page.waitForSelector('[role="listbox"], [role="option"]', { state: 'visible' });

  // Click on the option
  await page.getByRole('option', { name: optionText }).click();
}

/**
 * Check if user has specific role in the UI
 */
export async function verifyUserRole(
  page: Page,
  expectedRole: 'farmer' | 'mpk' | 'admin'
): Promise<void> {
  // Look for role indicator in navigation or user menu
  const roleIndicators: Record<string, string[]> = {
    farmer: ['/farmer', 'My Batches', 'Мои партии'],
    mpk: ['/mpk', 'Pool Requests', 'Заявки на пул'],
    admin: ['/admin', 'Admin Panel', 'Панель администратора'],
  };

  const indicators = roleIndicators[expectedRole];
  const url = page.url();

  const urlMatch = indicators.some((ind) => url.includes(ind));
  if (urlMatch) return;

  // Check for text indicators
  for (const text of indicators) {
    if (await page.getByText(text).isVisible().catch(() => false)) {
      return;
    }
  }

  throw new Error(`Could not verify role: ${expectedRole}`);
}

/**
 * Navigate to a section using sidebar/navigation
 */
export async function navigateTo(page: Page, menuItem: string): Promise<void> {
  // Try clicking on sidebar link
  const sidebarLink = page.locator(`nav a, [role="navigation"] a`).filter({
    hasText: menuItem,
  });

  if (await sidebarLink.isVisible().catch(() => false)) {
    await sidebarLink.click();
  } else {
    // Try main navigation
    await page.getByRole('link', { name: menuItem }).click();
  }

  await waitForLoadingComplete(page);
}

/**
 * Open a dialog/modal by clicking a trigger button
 */
export async function openDialog(
  page: Page,
  triggerText: string
): Promise<Locator> {
  await page.getByRole('button', { name: triggerText }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  return dialog;
}

/**
 * Close currently open dialog
 */
export async function closeDialog(page: Page): Promise<void> {
  // Try escape key first
  await page.keyboard.press('Escape');

  // If dialog still visible, try clicking close button
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible().catch(() => false)) {
    const closeButton = dialog.getByRole('button', { name: /close|cancel|отмена/i });
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    }
  }
}

/**
 * Confirm action in a confirmation dialog
 */
export async function confirmDialog(
  page: Page,
  confirmButtonText?: string
): Promise<void> {
  const dialog = page.getByRole('alertdialog');
  await dialog.waitFor({ state: 'visible' });

  const confirmButton = confirmButtonText
    ? dialog.getByRole('button', { name: confirmButtonText })
    : dialog.getByRole('button', { name: /confirm|yes|да|подтвердить/i });

  await confirmButton.click();
  await dialog.waitFor({ state: 'hidden' });
}

/**
 * Get table row by content
 */
export async function getTableRow(
  page: Page,
  content: string
): Promise<Locator> {
  return page.locator('tr').filter({ hasText: content });
}

/**
 * Check if element is visible with retry
 */
export async function isVisibleWithRetry(
  locator: Locator,
  timeout = 5000
): Promise<boolean> {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Take screenshot with descriptive name
 */
export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({
    path: `e2e/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Wait for network idle (useful after form submissions)
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout = 5000
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Generate unique test data
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get future date string
 */
export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return formatDateForInput(date);
}
