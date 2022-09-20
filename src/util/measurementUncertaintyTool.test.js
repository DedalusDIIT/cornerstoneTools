import Decimal from 'decimal.js';
import * as rounding from './measurementUncertaintyTool';

describe('util: measurementUncertaintyTool.js', () => {
  it('returns rounded value of the measurement when uncertainty below 1 and fisrt significant number is 1 or 2', () => {
    const inputValue = 291.9878225987628;
    const uncertainty = 0.02595339539885377778;

    const roundedValue = rounding.roundValue(inputValue, uncertainty);

    expect(roundedValue[0]).toEqual('291.988');
  });

  it('returns rounded value of the measurement when uncertainty below 1 and fisrt significant number is above 2', () => {
    const inputValue = 291.9878225987628;
    const uncertainty = 0.32595339539885377778;

    const roundedValue = rounding.roundValue(inputValue, uncertainty);

    expect(roundedValue[0]).toEqual('292.0');
  });

  it('returns rounded value of the measurement when uncertainty above 1 and fisrt significant number is 1 or 2', () => {
    const inputValue = 291.9878225987628;
    const uncertainty = 11.32595339539885377778;

    const roundedValue = rounding.roundValue(inputValue, uncertainty);

    expect(roundedValue[0]).toEqual(new Decimal(292));
  });

  it('returns rounded value of the measurement when uncertainty above 1 and fisrt significant number is above 2', () => {
    const inputValue = 291.9878225987628;
    const uncertainty = 31.32595339539885377778;

    const roundedValue = rounding.roundValue(inputValue, uncertainty);

    expect(roundedValue[0]).toEqual(new Decimal(290));
  });

  it('returns rounded value of the uncertainty', () => {
    const uncertainty = 0.2595339539885377778;

    const roundedUncertainty = rounding.roundValue(uncertainty, uncertainty);

    expect(roundedUncertainty[0]).toEqual('0.26');
  });
});
