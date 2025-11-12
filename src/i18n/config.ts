import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEN from './locales/en/common.json';
import commonTR from './locales/tr/common.json';
import navigationEN from './locales/en/navigation.json';
import navigationTR from './locales/tr/navigation.json';
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

// Define resources
const resources = {
  en: {
    common: commonEN,
    navigation: navigationEN,
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
};

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Fallback language
    defaultNS: 'common', // Default namespace
    ns: [
      'common',
      'navigation',
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
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Language detection options
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

/* 
USAGE EXAMPLES:

1. Basic usage:
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('common');
  return <button>{t('buttons.create')}</button>;
};

2. Multiple namespaces:
const { t } = useTranslation(['navigation', 'common']);
<h1>{t('navigation:dashboard')}</h1>

3. With interpolation:
<p>{t('validation.minLength', { count: 8 })}</p>

4. Change language:
const { i18n } = useTranslation();
i18n.changeLanguage('tr'); // Switch to Turkish
i18n.changeLanguage('en'); // Switch to English

5. Get current language:
const currentLanguage = i18n.language;

6. Date formatting with Intl API:
const date = new Date();
const formatted = new Intl.DateTimeFormat(i18n.language, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(date);

7. Currency formatting:
const price = 99.99;
const formatted = new Intl.NumberFormat(i18n.language, {
  style: 'currency',
  currency: 'USD'
}).format(price);
*/
