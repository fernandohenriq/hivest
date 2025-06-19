import 'reflect-metadata';

import { mainModule } from './exemple/modules/main.module';

async function fetchJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

(async () => {
  await mainModule.listen(3000);
  console.log('Server is running on port 3000');

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
  } catch (error) {
    console.error('Error during tests:', error);
  }
})();
