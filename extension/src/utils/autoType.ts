/**
 * Auto-type utility for inserting text into focused input elements
 */

interface AutoTypeOptions {
  delay?: number
  clearExisting?: boolean
  triggerEvents?: boolean
}

export async function autoType(text: string, options: AutoTypeOptions = {}): Promise<void> {
  const {
    delay = 50,
    clearExisting = false,
    triggerEvents = true
  } = options

  // Find the currently focused element
  const activeElement = document.activeElement as HTMLElement

  if (!activeElement) {
    throw new Error('No active element found')
  }

  // Check if the element can accept text input
  if (!isTextInputElement(activeElement)) {
    throw new Error('Active element is not a text input')
  }

  try {
    if (isInputOrTextarea(activeElement)) {
      await typeIntoInputElement(activeElement, text, { delay, clearExisting, triggerEvents })
    } else if (isContentEditable(activeElement)) {
      await typeIntoContentEditable(activeElement, text, { delay, clearExisting, triggerEvents })
    } else {
      throw new Error('Unsupported element type for auto-typing')
    }
  } catch (error) {
    console.error('Auto-type failed:', error)
    throw error
  }
}

function isTextInputElement(element: HTMLElement): boolean {
  return isInputOrTextarea(element) || isContentEditable(element)
}

function isInputOrTextarea(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
  const tagName = element.tagName.toLowerCase()
  
  if (tagName === 'textarea') {
    return true
  }
  
  if (tagName === 'input') {
    const inputType = (element as HTMLInputElement).type.toLowerCase()
    const textInputTypes = ['text', 'email', 'password', 'search', 'tel', 'url']
    return textInputTypes.includes(inputType)
  }
  
  return false
}

function isContentEditable(element: HTMLElement): boolean {
  return element.contentEditable === 'true' || 
         element.getAttribute('contenteditable') === 'true'
}

async function typeIntoInputElement(
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  options: Required<AutoTypeOptions>
): Promise<void> {
  const { delay, clearExisting, triggerEvents } = options

  // Clear existing content if requested
  if (clearExisting) {
    element.value = ''
  }

  // Get current cursor position
  const startPos = element.selectionStart || element.value.length
  const endPos = element.selectionEnd || element.value.length

  // Insert text at cursor position
  const beforeText = element.value.substring(0, startPos)
  const afterText = element.value.substring(endPos)
  
  if (delay > 0) {
    // Type character by character with delay
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const currentPos = startPos + i
      
      element.value = beforeText + text.substring(0, i + 1) + afterText
      element.setSelectionRange(currentPos + 1, currentPos + 1)
      
      if (triggerEvents) {
        triggerInputEvents(element)
      }
      
      if (i < text.length - 1) {
        await sleep(delay)
      }
    }
  } else {
    // Insert all text at once
    element.value = beforeText + text + afterText
    element.setSelectionRange(startPos + text.length, startPos + text.length)
    
    if (triggerEvents) {
      triggerInputEvents(element)
    }
  }

  // Focus the element to ensure it's active
  element.focus()
}

async function typeIntoContentEditable(
  element: HTMLElement,
  text: string,
  options: Required<AutoTypeOptions>
): Promise<void> {
  const { delay, clearExisting, triggerEvents } = options

  // Clear existing content if requested
  if (clearExisting) {
    element.textContent = ''
  }

  // Get current selection
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    // No selection, append to end
    element.focus()
    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  if (delay > 0) {
    // Type character by character with delay
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      
      // Insert character at current position
      document.execCommand('insertText', false, char)
      
      if (triggerEvents) {
        triggerContentEditableEvents(element)
      }
      
      if (i < text.length - 1) {
        await sleep(delay)
      }
    }
  } else {
    // Insert all text at once
    document.execCommand('insertText', false, text)
    
    if (triggerEvents) {
      triggerContentEditableEvents(element)
    }
  }

  // Ensure element stays focused
  element.focus()
}

function triggerInputEvents(element: HTMLInputElement | HTMLTextAreaElement): void {
  // Trigger input events that frameworks like React expect
  const events = ['input', 'change', 'keyup']
  
  events.forEach(eventType => {
    const event = new Event(eventType, {
      bubbles: true,
      cancelable: true
    })
    
    // Add additional properties for input events
    if (eventType === 'input') {
      Object.defineProperty(event, 'inputType', {
        value: 'insertText',
        writable: false
      })
    }
    
    element.dispatchEvent(event)
  })
}

function triggerContentEditableEvents(element: HTMLElement): void {
  // Trigger events for content editable elements
  const events = ['input', 'textInput', 'keyup']
  
  events.forEach(eventType => {
    const event = new Event(eventType, {
      bubbles: true,
      cancelable: true
    })
    
    element.dispatchEvent(event)
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Utility function to find the best text input on the page
export function findBestTextInput(): HTMLElement | null {
  // Priority order for finding text inputs
  const selectors = [
    'input[type="text"]:focus',
    'textarea:focus',
    '[contenteditable="true"]:focus',
    'input[type="text"]',
    'textarea',
    '[contenteditable="true"]',
    'input[type="email"]',
    'input[type="search"]'
  ]

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement
    if (element && isTextInputElement(element)) {
      return element
    }
  }

  return null
}

// Utility to check if auto-typing is possible on current page
export function canAutoType(): boolean {
  return !!findBestTextInput()
}
