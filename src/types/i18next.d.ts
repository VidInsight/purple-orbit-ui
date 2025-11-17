import 'i18next';
import common from '@/i18n/locales/en/common.json';
import navigation from '@/i18n/locales/en/navigation.json';
import auth from '@/i18n/locales/en/auth.json';
import workflows from '@/i18n/locales/en/workflows.json';
import executions from '@/i18n/locales/en/executions.json';
import credentials from '@/i18n/locales/en/credentials.json';
import databases from '@/i18n/locales/en/databases.json';
import variables from '@/i18n/locales/en/variables.json';
import files from '@/i18n/locales/en/files.json';
import apiKeys from '@/i18n/locales/en/apiKeys.json';
import users from '@/i18n/locales/en/users.json';
import billing from '@/i18n/locales/en/billing.json';
import dashboard from '@/i18n/locales/en/dashboard.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      navigation: typeof navigation;
      auth: typeof auth;
      workflows: typeof workflows;
      executions: typeof executions;
      credentials: typeof credentials;
      databases: typeof databases;
      variables: typeof variables;
      files: typeof files;
      apiKeys: typeof apiKeys;
      users: typeof users;
      billing: typeof billing;
      dashboard: typeof dashboard;
    };
  }
}
