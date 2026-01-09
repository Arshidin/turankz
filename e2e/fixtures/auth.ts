import { test as base, Page, BrowserContext } from '@playwright/test';

/**
 * Test users for E2E testing
 * These should match test accounts in your Supabase database
 */
export const TEST_USERS = {
  farmer: {
    email: process.env.TEST_FARMER_EMAIL || 'test-farmer@turan.kz',
    password: process.env.TEST_FARMER_PASSWORD || 'testpassword123',
  },
  mpk: {
    email: process.env.TEST_MPK_EMAIL || 'test-mpk@turan.kz',
    password: process.env.TEST_MPK_PASSWORD || 'testpassword123',
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'test-admin@turan.kz',
    password: process.env.TEST_ADMIN_PASSWORD || 'testpassword123',
  },
} as const;

export type UserRole = keyof typeof TEST_USERS;

/**
 * Extended test fixtures for authenticated testing
 */
type AuthFixtures = {
  farmerPage: Page;
  mpkPage: Page;
  adminPage: Page;
  authenticatedPage: (role: UserRole) => Promise<Page>;
};

/**
 * Login helper function
 */
async function loginAs(page: Page, role: UserRole): Promise<void> {
  const user = TEST_USERS[role];

  await page.goto('/login');

  // Wait for login form to be ready
  await page.waitForSelector('input[type="email"]', { state: 'visible' });

  // Fill credentials
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for redirect (dashboard or role-specific page)
  await page.waitForURL(/\/(dashboard|farmer|mpk|admin)/, { timeout: 15000 });
}

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  // Pre-authenticated farmer page
  farmerPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, 'farmer');
    await use(page);
    await context.close();
  },

  // Pre-authenticated MPK page
  mpkPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, 'mpk');
    await use(page);
    await context.close();
  },

  // Pre-authenticated admin page
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, 'admin');
    await use(page);
    await context.close();
  },

  // Dynamic authenticated page factory
  authenticatedPage: async ({ browser }, use) => {
    const pages: { context: BrowserContext; page: Page }[] = [];

    const factory = async (role: UserRole): Promise<Page> => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAs(page, role);
      pages.push({ context, page });
      return page;
    };

    await use(factory);

    // Cleanup all created contexts
    for (const { context } of pages) {
      await context.close();
    }
  },
});

export { expect } from '@playwright/test';
