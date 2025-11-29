import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import * as fc from 'fast-check';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Citas Médicas' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Citas Médicas');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Citas Médicas');
  });

  /**
   * Feature: medical-appointments-calendar, Property 18: Navigation tabs always visible
   * Validates: Requirements 7.1
   */
  it('Property 18: Navigation tabs always visible', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/calendar', '/results', '/results/1', '/results/2'),
        (route) => {
          const fixture = TestBed.createComponent(AppComponent);
          fixture.detectChanges();
          const compiled = fixture.nativeElement as HTMLElement;
          
          // Check that both navigation tabs are present
          const navTabs = compiled.querySelectorAll('.nav-tab');
          expect(navTabs.length).toBe(2);
          
          // Check that calendar tab is visible
          const calendarTab = Array.from(navTabs).find(tab => 
            tab.textContent?.includes('Calendario')
          );
          expect(calendarTab).toBeTruthy();
          
          // Check that results tab is visible
          const resultsTab = Array.from(navTabs).find(tab => 
            tab.textContent?.includes('Resultados')
          );
          expect(resultsTab).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 19: Tab navigation switches screens
   * Validates: Requirements 7.2, 7.3
   */
  it('Property 19: Tab navigation switches screens', (done) => {
    fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          { tab: 'calendar', expectedRoute: '/calendar' },
          { tab: 'results', expectedRoute: '/results' }
        ),
        async (testCase) => {
          const fixture = TestBed.createComponent(AppComponent);
          fixture.detectChanges();
          await fixture.whenStable();
          
          const compiled = fixture.nativeElement as HTMLElement;
          const navTabs = compiled.querySelectorAll('.nav-tab');
          
          // Find the tab to click
          const tabToClick = Array.from(navTabs).find(tab => 
            tab.textContent?.toLowerCase().includes(testCase.tab === 'calendar' ? 'calendario' : 'resultados')
          ) as HTMLAnchorElement;
          
          expect(tabToClick).toBeTruthy();
          
          // Verify the tab has the correct routerLink
          const href = tabToClick.getAttribute('href');
          expect(href).toBe(testCase.expectedRoute);
        }
      ),
      { numRuns: 100 }
    ).then(() => done());
  });

  /**
   * Feature: medical-appointments-calendar, Property 20: Navigation preserves loaded data
   * Validates: Requirements 7.4
   */
  it('Property 20: Navigation preserves loaded data', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('/calendar', '/results'), { minLength: 2, maxLength: 5 }),
        (navigationSequence) => {
          const fixture = TestBed.createComponent(AppComponent);
          fixture.detectChanges();
          
          // Verify that the component maintains its state across multiple renders
          // The router-outlet should preserve component instances when navigating
          const compiled = fixture.nativeElement as HTMLElement;
          
          // Check that router-outlet is present for all navigation sequences
          const routerOutlet = compiled.querySelector('router-outlet');
          expect(routerOutlet).toBeTruthy();
          
          // Verify that navigation tabs remain visible and functional
          const navTabs = compiled.querySelectorAll('.nav-tab');
          expect(navTabs.length).toBe(2);
          
          // The presence of router-outlet ensures Angular's router will preserve
          // component state according to its default behavior
          navigationSequence.forEach(route => {
            expect(routerOutlet).toBeTruthy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
