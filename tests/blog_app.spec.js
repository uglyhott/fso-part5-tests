import { expect, test } from '@playwright/test'
import { loginWith, createBlog } from './helper'

test.describe('Blog App', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Test User',
        username: 'tester',
        password: 'tested'
      }
    })
    await request.post('/api/users', {
      data: {
        name: 'Second User',
        username: 'adam',
        password: 'eva'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  test.describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'tester', 'tested')
      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'tester', 'wrong')

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('Wrong Credentials')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')

      await expect(page.getByText('Test User logged in')).not.toBeVisible()
    })
  })

  test.describe('When logged in', () => {
    test.beforeEach(async ({ page }) => {
      await loginWith(page, 'tester', 'tested')
    })
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'Test Title', 'Mr Test', 'http://www.test.com')
      
      const notificationDiv = page.locator('.notification')
      await expect(notificationDiv).toContainText('New blog added: Test Title by Mr Test')
      await expect(notificationDiv).toHaveCSS('border-style', 'solid')
      await expect(page.getByText('Test Title Mr Test')).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'Test Title', 'Mr Test', 'http://www.test.com')
      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.getByText('likes 0')).toBeVisible()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('a blog can be removed', async ({ page }) => {
      await createBlog(page, 'Test Title', 'Mr Test', 'http://www.test.com')
      await page.getByRole('button', { name: 'view' }).click()
      page.on('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'remove' }).click()
      
      const notificationDiv = page.locator('.notification')
      await expect(notificationDiv).toContainText('Blog removed')
      await expect(notificationDiv).toHaveCSS('border-style', 'solid')
      await expect(page.getByText('Test Title Mr Test')).not.toBeVisible()
    })

    test('remove button only visible to user who created blog', async ({ page }) => {
      await createBlog(page, 'Test Title', 'Mr Test', 'http://www.test.com')
      await page.getByRole('button', { name: 'Logout' }).click()

      await loginWith(page, 'adam', 'eva')
      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })
  })
})
