
import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../services/currency.service';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'price',
  standalone: true,
  pure: false // Impure to react to signal changes in the service
})
export class PricePipe implements PipeTransform {
  private currencyService = inject(CurrencyService);
  private currencyPipe = new CurrencyPipe('en-US');

  transform(value: number | null | undefined): string | null {
    if (value === null || value === undefined) return null;

    const convertedValue = this.currencyService.convert(value);
    const code = this.currencyService.currentCurrency();
    const symbol = this.currencyService.symbol();

    // Use Angular's CurrencyPipe for formatting but with our calculated value and symbol
    return this.currencyPipe.transform(
      convertedValue, 
      code, 
      'symbol', 
      '1.0-2'
    );
  }
}
