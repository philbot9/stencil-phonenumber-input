import { Component, Prop, Event, h, State, Watch, EventEmitter } from '@stencil/core'
import { AsYouType, parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js'

@Component({
  tag: 'phonenumber-input',
  styleUrl: 'phonenumber-input.css',
  shadow: true
})

export class MyComponent {
  private asYouTypeFormatter: AsYouType
  private phoneNumberIsValid: boolean

  @State() formattedPhoneNumber: string

  @Prop() defaultCountry: CountryCode
  @Prop() value: string

  @Event({
    eventName: 'phoneNumberInput',
    composed: true,
    cancelable: true,
    bubbles: true
  }) phoneNumberInput: EventEmitter;

  @Event({
    eventName: 'phoneNumberValidated',
    composed: true,
    cancelable: true,
    bubbles: true
  }) phoneNumberValidated: EventEmitter

  @Event({
    eventName: 'phoneNumberInvalidated',
    composed: true,
    cancelable: true,
    bubbles: true
  }) phoneNumberInvalidated: EventEmitter

  componentWillLoad() {
    this.asYouTypeFormatter = new AsYouType(this.defaultCountry)

    this.updateValue()
  }

  @Watch('defaultCountry')
  updateAsYouTypeFormatter() {
    this.asYouTypeFormatter = new AsYouType(this.defaultCountry)
    this.updateValue()
  }

  @Watch('value')
  updateValue() {
    const safeValue = this.value || ''

    this.asYouTypeFormatter.reset()
    this.formattedPhoneNumber = this.asYouTypeFormatter.input(safeValue)

    const phoneNumber = parsePhoneNumberFromString(safeValue, this.defaultCountry)

    const isValid = phoneNumber != null && phoneNumber.isValid()

    if (isValid && !this.phoneNumberIsValid) {
      this.phoneNumberIsValid = true
      this.phoneNumberValidated.emit({
        countryCallingCode: phoneNumber.countryCallingCode,
        nationalNumber: phoneNumber.nationalNumber,
        number: phoneNumber.number,
        country: phoneNumber.country,
        formattedNational: phoneNumber.formatNational(),
        formattedInternational: phoneNumber.formatInternational()
      })
    } else if (this.phoneNumberIsValid) {
      this.phoneNumberIsValid = false
      this.phoneNumberInvalidated.emit(safeValue)
    }
  }

  handleInput = (e) => {
    e.preventDefault()
    this.phoneNumberInput.emit(e.currentTarget.value)
  }

  render() {
    return (
      <input
        type="tel"
        onInput={this.handleInput}
        value={this.formattedPhoneNumber} />
    )
  }
}
