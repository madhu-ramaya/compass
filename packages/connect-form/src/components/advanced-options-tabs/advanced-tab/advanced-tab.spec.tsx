import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import ConnectionStringUrl from 'mongodb-connection-string-url';

import { readPreferences } from './../../../utils/read-preferences';

import AdvancedTab from './advanced-tab';

let updateConnectionFormFieldSpy: sinon.SinonSpy;

describe('AdvancedTab', function () {
  describe('no searchParam', function () {
    const connectionStringUrl = new ConnectionStringUrl(
      'mongodb+srv://0ranges:p!neapp1es@localhost/'
    );
    beforeEach(function () {
      updateConnectionFormFieldSpy = sinon.spy();
      render(
        <AdvancedTab
          errors={[]}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          updateConnectionFormField={updateConnectionFormFieldSpy}
          connectionStringUrl={connectionStringUrl}
        />
      );
    });

    it('renders view correctly', function () {
      expect(screen.getByTestId('read-preferences')).to.exist;
      expect(screen.getByTestId('default-database')).to.exist;
      expect(screen.getByTestId('url-options')).to.exist;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    readPreferences.forEach(({ id }) => {
      it(`handles changes on readPreference radio button - ${id}`, function () {
        fireEvent.click(screen.getByTestId(`${id}-preference-button`));
        expect(updateConnectionFormFieldSpy.callCount).to.equal(1);
        expect(updateConnectionFormFieldSpy.args[0][0]).to.deep.equal({
          type: 'update-search-param',
          currentKey: 'readPreference',
          value: id,
        });
      });
    });

    it(`handles changes on defaultDatabase field when user changes input`, function () {
      fireEvent.change(screen.getByTestId('default-database'), {
        target: { value: 'hello' },
      });
      expect(updateConnectionFormFieldSpy.callCount).to.equal(1);
      expect(updateConnectionFormFieldSpy.args[0][0]).to.deep.equal({
        type: 'update-connection-path',
        value: 'hello',
      });
    });
  });

  describe('renders selected values from connectionStringUrl', function () {
    const connectionStringUrl = new ConnectionStringUrl(
      'mongodb+srv://0ranges:p!neapp1es@localhost/admin'
    );
    beforeEach(function () {
      updateConnectionFormFieldSpy = sinon.spy();
      connectionStringUrl.searchParams.set('readPreference', 'nearest');
      render(
        <AdvancedTab
          errors={[]}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          updateConnectionFormField={updateConnectionFormFieldSpy}
          connectionStringUrl={connectionStringUrl}
        />
      );
    });
    it('renders selected values', function () {
      expect(
        screen
          .getByTestId('nearest-preference-button')
          .getAttribute('aria-checked')
      ).to.equal('true');
      expect(
        screen.getByTestId('default-database').getAttribute('value')
      ).to.equal('admin');
    });
  });
});

