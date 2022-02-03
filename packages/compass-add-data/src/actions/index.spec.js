import configureActions from './';

describe('#configureActions', () => {
  it('returns a new instance of the reflux actions', () => {
    expect(configureActions().startAddData).to.not.equal(undefined);
  });
});
