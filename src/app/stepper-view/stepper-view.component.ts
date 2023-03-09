import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  debounceTime,
  filter,
  BehaviorSubject,
  switchMap,
  takeUntil,
  tap,
  finalize,
  Subject
} from 'rxjs';
import { Suburb, SuburbOption } from '../suburbs/models/suburb.model';
import { SuburbService } from '../suburbs/services/suburb.service';

@Component({
  selector: 'app-stepper-view',
  templateUrl: './stepper-view.component.html',
  styleUrls: ['./stepper-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperViewComponent implements OnInit, OnDestroy {
  public formStepOne: FormGroup;
  public postCodeControl: FormControl;
  public suburbControl: FormControl;

  // List of options to be rendered by Select component
  public suburbsSelectList: SuburbOption[] = [];
  // List of selected options to be rendered as Chips component
  public selectedSuburbsChips: SuburbOption[] = [];

  public stepSelectedIndex: number;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private suburbService: SuburbService,
    private cd: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.initializeFormControls();
    this.initializeListeners();
  }

  public onStepChange(event: StepperSelectionEvent) {
    this.stepSelectedIndex = event.selectedIndex;

    if (this.stepSelectedIndex === 0) this.resetLoadingsOnChips();
  }

  public onRemoveChipClick(chipToRemove: SuburbOption): void {
    const selectedSuburbs: SuburbOption[] = this.suburbControl.value || [];

    const isInSelectList =
      this.suburbsSelectList.findIndex(listElement =>
        this.isEqualSuburbOption(listElement, chipToRemove)
      ) !== -1;

    const isSelected =
      selectedSuburbs?.findIndex(selectedElement =>
        this.isEqualSuburbOption(selectedElement, chipToRemove)
      ) !== -1;

    // If chip to remove is in select component list and is currently selected, we need to deselect it
    if (isInSelectList && isSelected) {
      const updatedSelectedSuburbs = selectedSuburbs.filter(
        e => !this.isEqualSuburbOption(e, chipToRemove)
      );
      this.suburbControl.setValue(updatedSelectedSuburbs, { emitEvent: false });
    }

    this.removeChip(chipToRemove);
  }

  private removeChip(suburbOption: SuburbOption): void {
    const indexToRemove = this.selectedSuburbsChips.findIndex(e =>
      this.isEqualSuburbOption(e, suburbOption)
    );

    this.selectedSuburbsChips.splice(indexToRemove, 1);
  }

  private addChip(suburbOption: SuburbOption): void {
    const alreadyExists =
      this.selectedSuburbsChips.findIndex(e =>
        this.isEqualSuburbOption(e, suburbOption)
      ) !== -1;

    if (!alreadyExists) this.selectedSuburbsChips.push(suburbOption);
  }

  private initializeFormControls(): void {
    this.postCodeControl = this.fb.control(null, Validators.required);

    this.suburbControl = this.fb.control(
      { value: null, disabled: true },
      Validators.required
    );

    this.formStepOne = this.fb.group({
      postcode: this.postCodeControl,
      suburb: this.suburbControl
    });
  }

  private initializeListeners(): void {
    this.postCodeControl.valueChanges
      .pipe(
        tap(postCode => {
          if (postCode.toString().length < 3) this.resetSuburbsControl();
        }),
        filter(postCode => postCode.toString().length >= 3),
        debounceTime(300),
        takeUntil(this.destroy$),
        switchMap(postCode => this.suburbService.getSuburbsByPostCode(postCode))
      )
      .subscribe(suburbs => {
        this.updateSuburbsList(suburbs);
      });

    this.suburbControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedSuburbs =>
        this.updateSelectedSuburbs(selectedSuburbs)
      );
  }

  private resetSuburbsControl(): void {
    this.suburbsSelectList = [];
    this.suburbControl.reset({ value: null, disabled: true });
  }

  private updateSuburbsList(suburbs: Suburb[]) {
    // List is updated so we enable back the control
    this.suburbControl.enable();

    // Generate the new list with suburb options
    this.suburbsSelectList = suburbs.map(suburb =>
      this.generateSuburbOption(suburb)
    );

    // User can have chips selected from previous postcodes searches
    // We programmatically select the suburbs that are present in chips and in new option list
    const optionsListToBeSelected =
      this.suburbsSelectList.filter(listElement =>
        this.selectedSuburbsChips.find(chip =>
          this.isEqualSuburbOption(chip, listElement)
        )
      ) || [];

    this.suburbControl.setValue(optionsListToBeSelected, { emitEvent: false });

    this.cd.markForCheck();
  }

  private updateSelectedSuburbs(selectedSuburbs: SuburbOption[]): void {
    // We clone list with slice so any possible removal does not affect our forEach loop
    this.selectedSuburbsChips.slice(0).forEach(selectedOption => {
      const isInSelectList =
        this.suburbsSelectList.findIndex(listElement =>
          this.isEqualSuburbOption(listElement, selectedOption)
        ) !== -1;

      const isSelected =
        selectedSuburbs?.findIndex(selectedElement =>
          this.isEqualSuburbOption(selectedElement, selectedOption)
        ) !== -1;

      if (isInSelectList && !isSelected) {
        this.removeChip(selectedOption);
      }
    });

    selectedSuburbs?.forEach(selectedOption => this.addChip(selectedOption));

    this.cd.markForCheck();
  }

  private generateSuburbOption(suburb: Suburb): SuburbOption {
    const isLoading$ = new BehaviorSubject<boolean>(true);

    return {
      suburb,
      neighbours: this.suburbService
        .getNeighbourSuburbs(suburb)
        .pipe(finalize(() => isLoading$.next(false))),
      isLoading$
    };
  }

  private resetLoadingsOnChips(): void {
    this.selectedSuburbsChips = this.selectedSuburbsChips.map(chip =>
      this.generateSuburbOption(chip.suburb)
    );
  }

  private isEqualSuburbOption(a: SuburbOption, b: SuburbOption): boolean {
    return (
      a.suburb.name === b.suburb.name &&
      a.suburb.postcode === b.suburb.postcode &&
      a.suburb.latitude === b.suburb.latitude &&
      a.suburb.longitude === b.suburb.longitude
    );
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }
}
