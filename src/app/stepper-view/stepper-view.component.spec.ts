import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { StepperViewComponent } from './stepper-view.component';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Suburb, SuburbOption } from '../suburbs/models/suburb.model';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { SuburbService } from '../suburbs/services/suburb.service';

describe('StepperViewComponent', () => {
  let component: StepperViewComponent;
  let fixture: ComponentFixture<StepperViewComponent>;
  let suburbService: SuburbService;

  const suburbMocked1: Suburb = {
    name: 'Burnley',
    postcode: 3121,
    state: {
      name: 'Victoria',
      abbreviation: 'VIC'
    },
    locality: 'MOORABBIN',
    latitude: -37.8229,
    longitude: 145.004
  };

  const suburbMocked2: Suburb = {
    name: 'Albert Park',
    postcode: 3206,
    state: {
      name: 'Victoria',
      abbreviation: 'VIC'
    },
    locality: 'MOORABBIN',
    latitude: -37.8463,
    longitude: 144.9631
  };

  const chipMocked: SuburbOption = {
    suburb: suburbMocked1,
    neighbours: of([suburbMocked2]),
    isLoading$: new BehaviorSubject(false)
  };

  const chipNotInListMocked: SuburbOption = {
    suburb: {
      name: 'Melbourne',
      postcode: 3000,
      state: {
        name: 'Victoria',
        abbreviation: 'VIC'
      },
      locality: 'MELBOURNE CITY',
      latitude: -37.8232,
      longitude: 144.9729
    },
    neighbours: of([suburbMocked2]),
    isLoading$: new BehaviorSubject(false)
  };

  const chipToBeAdded: SuburbOption = {
    suburb: {
      name: 'Melbourne City',
      postcode: 3001,
      state: {
        name: 'Victoria',
        abbreviation: 'VIC'
      },
      locality: 'MELBOURNE CITY',
      latitude: -38,
      longitude: 145
    },
    neighbours: of([suburbMocked2]),
    isLoading$: new BehaviorSubject(false)
  };

  const mockGetSuburbsByPostCode = [suburbMocked1];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepperViewComponent],
      providers: [SuburbService],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    suburbService = TestBed.inject(SuburbService);
    spyOn(suburbService, 'getSuburbsByPostCode').and.returnValue(
      of(mockGetSuburbsByPostCode)
    );

    fixture = TestBed.createComponent(StepperViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.suburbControl.setValue([chipMocked]);

    component.suburbsSelectList = [
      {
        suburb: suburbMocked1,
        neighbours: of([suburbMocked2]),
        isLoading$: new BehaviorSubject(false)
      },
      {
        suburb: suburbMocked2,
        neighbours: of([suburbMocked1]),
        isLoading$: new BehaviorSubject(false)
      }
    ];

    component.selectedSuburbsChips = [chipMocked, chipNotInListMocked];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('step index tests', () => {
    it('should update step index when step changes', () => {
      const stepEventMock: Partial<StepperSelectionEvent> = {
        selectedIndex: 0
      };
      component.onStepChange(stepEventMock as StepperSelectionEvent);

      expect(component.stepSelectedIndex).toBe(0);
    });

    it('should reset loading suburbs when step index is 0', () => {
      spyOn<any>(component, 'resetLoadingsOnChips');

      const stepEventMock: Partial<StepperSelectionEvent> = {
        selectedIndex: 0
      };
      component.onStepChange(stepEventMock as StepperSelectionEvent);

      expect(component['resetLoadingsOnChips']).toHaveBeenCalled();
    });
  });

  describe('add/remove chips', () => {
    it('should call remove chips method', () => {
      spyOn<any>(component, 'removeChip');

      component.onRemoveChipClick(chipMocked);

      expect(component['removeChip']).toHaveBeenCalled();
    });

    it('should remove chip from selected', () => {
      expect(component.selectedSuburbsChips.includes(chipMocked)).toBeTrue();

      component.onRemoveChipClick(chipMocked);

      expect(component.selectedSuburbsChips.includes(chipMocked)).toBeFalse();
    });

    it('should remove chip from select component as well if in list', () => {
      expect(component.suburbControl.value.includes(chipMocked)).toBeTrue();

      component.onRemoveChipClick(chipMocked);

      expect(component.suburbControl.value.includes(chipMocked)).toBeFalse();
    });

    it('should add chip', () => {
      expect(
        component.selectedSuburbsChips.includes(chipToBeAdded)
      ).toBeFalse();

      component['addChip'](chipToBeAdded);

      expect(component.selectedSuburbsChips.includes(chipToBeAdded)).toBeTrue();
    });

    it('should not add chip if already exists', () => {
      const beforeLength = component.selectedSuburbsChips.length;

      expect(component.selectedSuburbsChips.includes(chipMocked)).toBeTrue();

      component['addChip'](chipMocked);

      const afterLength = component.selectedSuburbsChips.length;

      expect(beforeLength === afterLength).toBeTrue();
    });
  });

  describe('form control listeners configuration', () => {
    it('should call endpoint after 300 milliseconds when postcode is filled with at least 3 digits', fakeAsync(() => {
      component.postCodeControl.setValue(333);
      tick(300);

      expect(suburbService.getSuburbsByPostCode).toHaveBeenCalled();
    }));

    it('should not call endpoint when postcode is filled with less than 3 digits', fakeAsync(() => {
      component.postCodeControl.setValue(33);
      tick(300);

      expect(suburbService.getSuburbsByPostCode).toHaveBeenCalledTimes(0);
    }));

    it('should reset suburbsControl when postcode is filled with less than 3 digits', fakeAsync(() => {
      spyOn<any>(component, 'resetSuburbsControl');

      component.postCodeControl.setValue(33);
      tick(300);

      expect(component['resetSuburbsControl']).toHaveBeenCalledTimes(1);
    }));

    it('should call updateSuburbsList with the service response', fakeAsync(() => {
      spyOn<any>(component, 'updateSuburbsList');

      component.postCodeControl.setValue(333);
      tick(300);

      expect(component['updateSuburbsList']).toHaveBeenCalledWith(
        mockGetSuburbsByPostCode
      );
    }));

    it('should call updateSelectedSuburbs method when suburb control value is changed', () => {
      const suburbOptions = [chipMocked];

      spyOn<any>(component, 'updateSelectedSuburbs');

      component.suburbControl.setValue(suburbOptions);
      expect(component['updateSelectedSuburbs']).toHaveBeenCalledWith(
        suburbOptions
      );
    });
  });

  describe('select component list and chips synchronization', () => {
    it('should empty select list and suburb control value & disable it when reset is called', () => {
      component.suburbControl.enable({ emitEvent: false });
      expect(component.suburbsSelectList.length > 0).toBe(true);
      expect(component.suburbControl.disabled).toBe(false);

      component['resetSuburbsControl']();

      expect(component.suburbsSelectList.length === 0).toBe(true);
      expect(component.suburbControl.disabled).toBe(true);
    });

    it('should enable suburb control when updateSuburbsList is called', () => {
      expect(component.suburbControl.disabled).toBe(true);
      component['updateSuburbsList']([suburbMocked1]);
      expect(component.suburbControl.disabled).toBe(false);
    });

    it('should populate list of suburbs with service response', fakeAsync(() => {
      component.postCodeControl.setValue(333);
      tick(300);

      expect(component.suburbsSelectList.length).toBe(1);
      const isMockedBESuburbInList = component['isEqualSuburbOption'](
        component.suburbsSelectList[0],
        { suburb: suburbMocked1 } as SuburbOption
      );

      expect(isMockedBESuburbInList).toBeTrue();
      expect(component.suburbsSelectList[0].neighbours).toBeDefined();
      expect(component.suburbsSelectList[0].isLoading$).toBeDefined();
    }));

    it('should mark as selected in select component a suburb present in chips (was selected previously)', () => {
      component.suburbsSelectList = [];
      component.suburbControl.setValue(null, { emitEvent: false });
      component.selectedSuburbsChips = [chipMocked];

      const selectList = [suburbMocked1];

      component['updateSuburbsList'](selectList);

      expect(component.suburbControl.value[0].suburb).toBe(suburbMocked1);
    });

    it('should remove chips when the suburb is unselected from select list', () => {
      component.selectedSuburbsChips = [chipMocked];
      component.suburbControl.setValue([]);

      expect(component.selectedSuburbsChips.length).toBe(0);
    });

    it('should add chips when suburbs are selected in component', () => {
      spyOn<any>(component, 'addChip');

      component.selectedSuburbsChips = [chipMocked];
      component.suburbsSelectList = [chipMocked, chipToBeAdded];
      component.suburbControl.setValue([chipMocked, chipToBeAdded]);

      expect(component['addChip']).toHaveBeenCalledTimes(2);
    });
  });

  describe('generation of SuburbOption from Suburb', () => {
    it('should save suburb into suburb property', () => {
      const suburbOption = component['generateSuburbOption'](suburbMocked1);

      const suburbsAreEqual = component['isEqualSuburbOption'](suburbOption, {
        suburb: suburbMocked1
      } as SuburbOption);

      expect(suburbsAreEqual).toBe(true);
    });

    it('should have loading as true at first but turned into false once getNeighbours request is completed', fakeAsync(() => {
      spyOn(suburbService, 'getNeighbourSuburbs').and.returnValue(EMPTY);
      const suburbOption = component['generateSuburbOption'](suburbMocked1);

      expect(suburbOption.isLoading$.value).toBe(true);
      suburbOption.neighbours.subscribe();

      tick(250);

      expect(suburbOption.isLoading$.value).toBe(false);
    }));

    it('should reset loadings of SuburbOption correctly', () => {
      component.selectedSuburbsChips[0].isLoading$.next(false);

      component['resetLoadingsOnChips']();

      expect(component.selectedSuburbsChips[0].isLoading$.value).toBe(true);
    });
  });

  it('should check name, postcode and coordinates for equality between suburbs', () => {
    const suburbMocked1: Partial<Suburb> = {
      name: 'Burnley',
      postcode: 3121,
      latitude: -37.8229,
      longitude: 145.004
    };

    const suburbMocked2: Partial<Suburb> = {
      name: 'Burnley',
      postcode: 3121,
      latitude: -37.8229,
      longitude: 145.004
    };

    expect(
      component['isEqualSuburbOption'](
        { suburb: suburbMocked1 } as SuburbOption,
        { suburb: suburbMocked2 } as SuburbOption
      )
    ).toBe(true);

    expect(
      component['isEqualSuburbOption'](
        { suburb: suburbMocked1 } as SuburbOption,
        { suburb: { ...suburbMocked2, longitude: 1 } } as SuburbOption
      )
    ).toBe(false);

    expect(
      component['isEqualSuburbOption'](
        { suburb: suburbMocked1 } as SuburbOption,
        { suburb: { ...suburbMocked2, latitude: 1 } } as SuburbOption
      )
    ).toBe(false);

    expect(
      component['isEqualSuburbOption'](
        { suburb: suburbMocked1 } as SuburbOption,
        { suburb: { ...suburbMocked2, name: 'test' } } as SuburbOption
      )
    ).toBe(false);

    expect(
      component['isEqualSuburbOption'](
        { suburb: suburbMocked1 } as SuburbOption,
        { suburb: { ...suburbMocked2, postcode: 1 } } as SuburbOption
      )
    ).toBe(false);
  });
});
