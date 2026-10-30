import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Login', () => {
  test.use({ storageState: { cookies: [], origins: [] } });   // start with no session
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('standard user can log in', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('locked-out user sees an error', async () => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    await expect(loginPage.error).toContainText('locked out');
  });

  test('wrong password shows an error', async () => {
    await loginPage.login('standard_user', 'wrong_password');
    await expect(loginPage.error).toContainText('do not match');
  });
});

test.describe('Cart and checkout', () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    // const loginPage = new LoginPage(page);
    // await loginPage.goto();
    // await loginPage.login('standard_user', 'secret_sauce');
    await page.goto('/inventory.html');   // already logged in from the saved session
    inventory = new InventoryPage(page);
  });

  test('adding a backpack updates the cart badge', async () => {
    await inventory.addToCart('sauce-labs-backpack');
    await expect(inventory.cartBadge).toHaveText('1');
  });

  test('user can complete a checkout', async ({ page }) => {
    const checkout = new CheckoutPage(page);

    await inventory.addToCart('sauce-labs-backpack');
    await inventory.openCart();
    await checkout.start();
    await checkout.fillInfo('Brad', 'Brooks', '30107');
    await checkout.finish();

    await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
  });
});
