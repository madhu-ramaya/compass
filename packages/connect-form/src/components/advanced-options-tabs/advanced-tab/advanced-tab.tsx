import React, { ChangeEvent, useCallback } from 'react';
import { ConnectionOptions } from 'mongodb-data-service';
import {
  RadioBox,
  RadioBoxGroup,
  spacing,
  TextInput,
  Label,
  IconButton,
  Icon,
  css,
} from '@mongodb-js/compass-components';
import ConnectionStringUrl from 'mongodb-connection-string-url';
import { MongoClientOptions } from 'mongodb';

import FormFieldContainer from '../../form-field-container';
import { UpdateConnectionFormField } from '../../../hooks/use-connect-form';
import { readPreferences } from '../../../utils/read-preferences';

import UrlOptions from './url-options';
import { ConnectionFormError } from '../../../utils/validation';

const infoButtonStyles = css({
  verticalAlign: 'middle',
  marginTop: -spacing[1],
});

const containerStyles = css({
  marginTop: spacing[3],
});

const fieldStyles = css({
  width: '50%',
});

function AdvancedTab({
  updateConnectionFormField,
  connectionStringUrl,
}: {
  errors: ConnectionFormError[];
  connectionStringUrl: ConnectionStringUrl;
  updateConnectionFormField: UpdateConnectionFormField;
  connectionOptions?: ConnectionOptions;
}): React.ReactElement {
  const { searchParams, pathname } = connectionStringUrl;
  const readPreference = searchParams.get('readPreference');
  const replicaSet = searchParams.get('replicaSet');
  const defaultDatabase = pathname.startsWith('/')
    ? pathname.substr(1)
    : pathname;

  const handleFieldChanged = useCallback(
    (key: keyof MongoClientOptions, value?: string) => {
      if (!value) {
        return updateConnectionFormField({
          type: 'delete-search-param',
          key,
        });
      }
      return updateConnectionFormField({
        type: 'update-search-param',
        currentKey: key,
        value,
      });
    },
    [updateConnectionFormField]
  );

  const handlePathChanged = useCallback(
    (value: string) => {
      return updateConnectionFormField({
        type: 'update-connection-path',
        value,
      });
    },
    [updateConnectionFormField]
  );

  return (
    <div className={containerStyles}>
      {/* Read Preferences */}
      <Label htmlFor="read-preferences">
        Read Preference
        <IconButton
          className={infoButtonStyles}
          aria-label="Read Preference Documentation"
          href="https://docs.mongodb.com/manual/reference/connection-string/#read-preference-options"
          target="_blank"
        >
          <Icon glyph="InfoWithCircle" size="small" />
        </IconButton>
      </Label>
      <RadioBoxGroup
        onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
          handleFieldChanged('readPreference', value);
        }}
        value={readPreference ?? ''}
        data-testid="read-preferences"
        id="read-preferences"
      >
        {readPreferences.map(({ title, id }) => {
          return (
            <RadioBox
              data-testid={`${id}-preference-button`}
              checked={readPreference === id}
              value={id}
              key={id}
            >
              {title}
            </RadioBox>
          );
        })}
      </RadioBoxGroup>
      {/* Replica Set */}
      <FormFieldContainer>
        <TextInput
          spellCheck={false}
          className={fieldStyles}
          onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            handleFieldChanged('replicaSet', value);
          }}
          name={'replica-set'}
          data-testid={'replica-set'}
          label={'Replica Set Name'}
          type={'text'}
          optional={true}
          value={replicaSet ?? ''}
        />
      </FormFieldContainer>
      {/* Default Database */}
      <FormFieldContainer>
        <TextInput
          spellCheck={false}
          className={fieldStyles}
          onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
            handlePathChanged(value);
          }}
          name={'default-database'}
          data-testid={'default-database'}
          label={'Default Database'}
          type={'text'}
          optional={true}
          value={defaultDatabase ?? ''}
          description={
            'Default database will be the one you authenticate on. Leave this field empty if you want the default behaviour.'
          }
        />
      </FormFieldContainer>
      <UrlOptions
        connectionStringUrl={connectionStringUrl}
        updateConnectionFormField={updateConnectionFormField}
      />
    </div>
  );
}

export default AdvancedTab;
