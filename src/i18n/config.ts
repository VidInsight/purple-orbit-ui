import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import commonEN from './locales/en/common.json';
import commonTR from './locales/tr/common.json';
import navigationEN from './locales/en/navigation.json';
import navigationTR from './locales/tr/navigation.json';
import authEN from './locales/en/auth.json';
import authTR from './locales/tr/auth.json';
import workflowsEN from './locales/en/workflows.json';
import workflowsTR from './locales/tr/workflows.json';
import executionsEN from './locales/en/executions.json';
import executionsTR from './locales/tr/executions.json';
import credentialsEN from './locales/en/credentials.json';
import credentialsTR from './locales/tr/credentials.json';
import databasesEN from './locales/en/databases.json';
import databasesTR from './locales/tr/databases.json';
import variablesEN from './locales/en/variables.json';
import variablesTR from './locales/tr/variables.json';
import filesEN from './locales/en/files.json';
import filesTR from './locales/tr/files.json';
import apiKeysEN from './locales/en/apiKeys.json';
import apiKeysTR from './locales/tr/apiKeys.json';
import usersEN from './locales/en/users.json';
import usersTR from './locales/tr/users.json';
import billingEN from './locales/en/billing.json';
import billingTR from './locales/tr/billing.json';
import dashboardEN from './locales/en/dashboard.json';
import dashboardTR from './locales/tr/dashboard.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEN,
        navigation: navigationEN,
        auth: authEN,
        workflows: workflowsEN,
        executions: executionsEN,
        credentials: credentialsEN,
        databases: databasesEN,
        variables: variablesEN,
        files: filesEN,
        apiKeys: apiKeysEN,
        users: usersEN,
        billing: billingEN,
        dashboard: dashboardEN,
      },
      tr: {
        common: commonTR,
        navigation: navigationTR,
        auth: authTR,
        workflows: workflowsTR,
        executions: executionsTR,
        credentials: credentialsTR,
        databases: databasesTR,
        variables: variablesTR,
        files: filesTR,
        apiKeys: apiKeysTR,
        users: usersTR,
        billing: billingTR,
        dashboard: dashboardTR,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [
      'common',
      'navigation',
      'auth',
      'workflows',
      'executions',
      'credentials',
      'databases',
      'variables',
      'files',
      'apiKeys',
      'users',
      'billing',
      'dashboard',
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
