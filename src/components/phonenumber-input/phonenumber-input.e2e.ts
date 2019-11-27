import { newE2EPage } from '@stencil/core/testing';

describe('phonenumber-input', () => {
  const renderComponent = async (html: string) => {
    const page = await newE2EPage()
    await page.setContent(html)

    const element = await page.find('phonenumber-input')

    return { page, element }
  }

  it('renders', async () => {
    const { element } = await renderComponent('<phonenumber-input></phonenumber-input>')
    expect(element).not.toBeNull();
  })

  it('accepts input', async () => {
    const { page, element } = await renderComponent('<phonenumber-input></phonenumber-input>')
    const input = await page.find('phonenumber-input >>> input')

    const inputEvent = await element.spyOnEvent('phoneNumberInput');

    await input.press('1')
    await input.press('2')
    await input.press('3')

    await page.waitForChanges()

    expect(inputEvent).toHaveReceivedEventDetail('123')
  })

  it('formats as you type', async () => {
    const { page, element } = await renderComponent('<phonenumber-input></phonenumber-input>')
    const input = await page.find('phonenumber-input >>> input')

    element.setProperty('defaultCountry', 'CA')

    element.setProperty('value', '613')
    await page.waitForChanges()
    expect(await input.getProperty('value')).toEqual('(613)')

    element.setProperty('value', '6138')
    await page.waitForChanges()
    expect(await input.getProperty('value')).toEqual('(613) 8')

    element.setProperty('value', '6138011')
    await page.waitForChanges()
    expect(await input.getProperty('value')).toEqual('(613) 801-1')

    element.setProperty('value', '6138011234')
    await page.waitForChanges()
    expect(await input.getProperty('value')).toEqual('(613) 801-1234')
  })

  it('validates phone number', async () => {
    const { page, element } = await renderComponent('<phonenumber-input></phonenumber-input>')

    const validatedEvent = await element.spyOnEvent('phoneNumberValidated')

    const phoneNumber = "6138011234"

    element.setProperty('defaultCountry', 'CA')
    element.setProperty('value', phoneNumber)

    await page.waitForChanges()

    const event = validatedEvent.firstEvent

    expect(event.detail).toEqual({
      countryCallingCode: '1',
      nationalNumber: phoneNumber,
      number: `+1${phoneNumber}`,
      country: 'CA',
      formattedNational: '(613) 801-1234',
      formattedInternational: '+1 613 801 1234'
    })
  })

  it('invalidates phone number', async () => {
    const { page, element } = await renderComponent('<phonenumber-input></phonenumber-input>')

    const invalidatedEvent = await element.spyOnEvent('phoneNumberInvalidated')

    const validPhoneNumber = '6138011234'
    const invalidPhoneNumber = '123765'

    element.setProperty('defaultCountry', 'CA')
    element.setProperty('value', validPhoneNumber)

    await page.waitForChanges()

    element.setProperty('value', invalidPhoneNumber)

    await page.waitForChanges()

    expect(invalidatedEvent).toHaveReceivedEventDetail(invalidPhoneNumber)
  })
});
