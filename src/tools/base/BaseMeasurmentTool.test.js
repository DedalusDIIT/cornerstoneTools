import BaseMeasurmentTool from './BaseMeasurmentTool';

describe('BaseMeasurmentTool.js', () => {
  describe('displayUncertainties', () => {
    it('should have the value "false"', () => {
      const instantiatedTool = new BaseMeasurmentTool();

      expect(instantiatedTool.displayUncertainties).toBe(false);
    });

    it('should be able to configure it on the constructor', () => {
      const instantiatedTool = new BaseMeasurmentTool({
        configuration: { displayUncertainties: true },
      });

      expect(instantiatedTool.displayUncertainties).toBe(true);
    });

    it('should be able to set it after instantiated', () => {
      const instantiatedTool = new BaseMeasurmentTool({
        configuration: { displayUncertainties: false },
      });

      instantiatedTool.mergeOptions({ displayUncertainties: true });

      expect(instantiatedTool.displayUncertainties).toBe(true);
    });
  });
});
