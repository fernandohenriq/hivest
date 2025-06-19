import 'reflect-metadata';

import { mainModule } from './modules/main.module';

async function fetchJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

(async () => {
  await mainModule.listen(3000);

  try {
    // Test company endpoints
    const companyCreated = await fetchJson('http://localhost:3000/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '1', name: 'Acme Corp', domain: 'acme.com' }),
    });
    console.log('CREATE COMPANY', companyCreated);

    const companyFound = await fetchJson('http://localhost:3000/api/companies/1');
    console.log('GET COMPANY', companyFound);

    // Test user endpoints
    const userCreated = await fetchJson('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '1', name: 'John Doe' }),
    });
    console.log('CREATE USER', userCreated);

    const userFound = await fetchJson('http://localhost:3000/api/users/1');
    console.log('GET USER', userFound);

    // Test auth endpoints (new hierarchy)
    const loginResult = await fetchJson('http://localhost:3000/api/users/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'john', password: 'password123' }),
    });
    console.log('AUTH LOGIN', loginResult);

    const profileResult = await fetchJson('http://localhost:3000/api/users/auth/profile');
    console.log('AUTH PROFILE', profileResult);

    const registerResult = await fetchJson('http://localhost:3000/api/users/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '2', name: 'Jane Smith' }),
    });
    console.log('AUTH REGISTER', registerResult);

    const logoutResult = await fetchJson('http://localhost:3000/api/users/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('AUTH LOGOUT', logoutResult);

    // Test settings endpoints (another hierarchy level)
    const settingsResult = await fetchJson('http://localhost:3000/api/users/settings/');
    console.log('SETTINGS GET', settingsResult);

    const themeResult = await fetchJson('http://localhost:3000/api/users/settings/theme', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme: 'light' }),
    });
    console.log('SETTINGS THEME', themeResult);

    const notificationsResult = await fetchJson(
      'http://localhost:3000/api/users/settings/notifications',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: false }),
      },
    );
    console.log('SETTINGS NOTIFICATIONS', notificationsResult);
  } catch (error) {
    console.error('Error during tests:', error);
  }
})();
