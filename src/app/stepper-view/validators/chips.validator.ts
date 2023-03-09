import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { SuburbOption } from 'src/app/suburbs/models/suburb.model';

/**
 * Validates if chips are present before applying a required validator to form fields
 * @param chips the existing chips (selected suburbs)
 * @returns validation required error if control is empty and no chips selected
 */
export function chipsValidator(chips: SuburbOption[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let result = null;

    if (
      (!control.value || control.value?.length === 0) &&
      chips?.length === 0
    ) {
      result = Validators.required(control);
    }

    return result;
  };
}
