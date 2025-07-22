import { test, expect } from '@playwright/test'

test.describe('Rehbar AI Extension', () => {
  test('should load options page correctly', async ({ page }) => {
    await page.goto('/src/options/Options.html')
    
    await expect(page.locator('h1')).toContainText('Rehbar AI Settings')
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Test")')).toBeVisible()
  })

  test('should validate API key input', async ({ page }) => {
    await page.goto('/src/options/Options.html')
    
    const apiKeyInput = page.locator('input[type="password"]')
    const testButton = page.locator('button:has-text("Test")')
    
    // Test with empty key
    await testButton.click()
    await expect(page.locator('text=Please enter an API key')).toBeVisible()
    
    // Test with invalid key
    await apiKeyInput.fill('invalid-key')
    await testButton.click()
    await expect(page.locator('text=Testing...')).toBeVisible()
  })

  test('should toggle between interview and sales modes', async ({ page }) => {
    await page.goto('/src/options/Options.html')
    
    const interviewButton = page.locator('button:has-text("Interview")')
    const salesButton = page.locator('button:has-text("Sales")')
    
    // Should start with interview mode selected
    await expect(interviewButton).toHaveClass(/bg-blue-500/)
    
    // Click sales mode
    await salesButton.click()
    await expect(salesButton).toHaveClass(/bg-purple-500/)
    await expect(interviewButton).not.toHaveClass(/bg-blue-500/)
  })

  test('should adjust response length slider', async ({ page }) => {
    await page.goto('/src/options/Options.html')
    
    const slider = page.locator('input[type="range"]')
    const lengthDisplay = page.locator('text=/Response Length.*: \\d+/')
    
    // Check initial value
    await expect(lengthDisplay).toContainText('80')
    
    // Move slider
    await slider.fill('120')
    await expect(lengthDisplay).toContainText('120')
  })

  test('should handle file uploads', async ({ page }) => {
    await page.goto('/src/options/Options.html')
    
    // Mock file upload
    const resumeInput = page.locator('#resume-upload')
    const productInput = page.locator('#product-upload')
    
    await expect(resumeInput).toBeHidden()
    await expect(productInput).toBeHidden()
    
    // Check upload labels
    await expect(page.locator('text=Click to upload resume')).toBeVisible()
    await expect(page.locator('text=Click to upload product info')).toBeVisible()
  })

  test('should save settings', async ({ page }) => {
    await page.goto('/src/options/Options.html')
    
    const saveButton = page.locator('button:has-text("Save Settings")')
    
    // Fill in some settings
    await page.locator('input[type="password"]').fill('test-api-key')
    await page.locator('input[type="range"]').fill('100')
    
    // Save settings
    await saveButton.click()
    await expect(page.locator('text=Saving...')).toBeVisible()
  })

  test('should load popup correctly', async ({ page }) => {
    await page.goto('/src/popup/Popup.html')
    
    await expect(page.locator('h1')).toContainText('Rehbar AI')
    await expect(page.locator('text=Current page:')).toBeVisible()
    await expect(page.locator('text=Mode:')).toBeVisible()
    await expect(page.locator('button:has-text("Start Listening")')).toBeVisible()
  })

  test('should show setup status in popup', async ({ page }) => {
    await page.goto('/src/popup/Popup.html')
    
    // Check status indicators
    await expect(page.locator('text=API Key')).toBeVisible()
    await expect(page.locator('text=Resume')).toBeVisible()
    
    // Should show red dots for unconfigured items
    const statusDots = page.locator('.w-2.h-2.rounded-full')
    await expect(statusDots).toHaveCount(2)
  })

  test('should handle mode toggle in popup', async ({ page }) => {
    await page.goto('/src/popup/Popup.html')
    
    const modeButton = page.locator('button:has([class*="w-3 h-3"])')
    
    // Should start with interview mode
    await expect(page.locator('text=Interview')).toBeVisible()
    
    // Toggle to sales mode
    await modeButton.click()
    await expect(page.locator('text=Sales')).toBeVisible()
  })

  test('should show usage statistics', async ({ page }) => {
    await page.goto('/src/popup/Popup.html')
    
    await expect(page.locator('text=Sessions:')).toBeVisible()
    await expect(page.locator('text=Tokens:')).toBeVisible()
  })
})
