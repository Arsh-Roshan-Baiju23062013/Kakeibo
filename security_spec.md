# Firestore Security Specification & TDD Test Plan

## 1. Data Invariants
- **Scope**: User profiles and their financial dashboards (expenses, earnings, stock market investments).
- **Core Invariant**: Every document in the database is bound to a specific user's dashboard. A user's documents are stored under `/users/{userId}`, where `{userId}` must strictly match the authenticated user's ID (`request.auth.uid`).
- **Owner Verification**: Users cannot read, create, update, or delete any data under a dashboard path that does not belong to them.
- **Strict Data Integrity**: All fields of user profiles, expenses, earnings, and stock investments must be of the correct type, conform to length limits, and represent valid business data structure. No "ghost fields" or untyped overrides are allowed.
- **Temporal Invariant**: Creation/Modification timestamps do not exist currently as fields in the UI, but all date fields must be valid ISO-8601 strings, and permissions must strictly block any cross-user leakage.

---

## 2. The "Dirty Dozen" Malicious Payloads

### Payload 1: Unauthenticated Profile Write (Identity Spoofing)
- **Path**: `/users/attacker_uid`
- **Payload**:
  ```json
  {
    "name": "Attacker",
    "jobTitle": "Hacker",
    "email": "attacker@gmail.com",
    "currency": "USD"
  }
  ```
- **Context**: Request made with `request.auth == null`.
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 2: Cross-User Profile Write (Identity Spoofing)
- **Path**: `/users/victim_uid`
- **Payload**:
  ```json
  {
    "name": "Attacker Profile",
    "jobTitle": "Impersonator",
    "email": "victim@gmail.com",
    "currency": "USD"
  }
  ```
- **Context**: Request made with `request.auth.uid == "attacker_uid"`.
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 3: Value Poisoning on Profile (Invalid Types)
- **Path**: `/users/victim_uid`
- **Payload**:
  ```json
  {
    "name": 12345,
    "jobTitle": true,
    "email": "victim@gmail.com",
    "currency": ["USD"]
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 4: Resource Poisoning via Gigantic User Profile Name
- **Path**: `/users/victim_uid`
- **Payload**:
  ```json
  {
    "name": "A".repeat(5000),
    "jobTitle": "Product Manager",
    "email": "victim@gmail.com",
    "currency": "USD"
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 5: Array Guard Bypass / Category Bombing
- **Path**: `/users/victim_uid`
- **Payload**:
  ```json
  {
    "name": "Alex",
    "jobTitle": "Staff Engineer",
    "email": "alex@example.com",
    "currency": "USD",
    "categories": ["Category"] * 100
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED` (Categories exceeds size limit of 30)

### Payload 6: Cross-User Expense Write
- **Path**: `/users/victim_uid/expenses/victim_exp_id`
- **Payload**:
  ```json
  {
    "amount": 500,
    "category": "Rent",
    "date": "2026-05-28T07:00:00.000Z"
  }
  ```
- **Context**: Authenticated as `attacker_uid`.
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 7: Value Poisoning on Expense (Non-Numeric Amount)
- **Path**: `/users/user_uid/expenses/exp_id`
- **Payload**:
  ```json
  {
    "amount": "Five Hundred Dollars",
    "category": "Travel",
    "date": "2026-05-28T07:00:00.000Z"
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 8: Cross-User Earning Write
- **Path**: `/users/victim_uid/earnings/victim_earn_id`
- **Payload**:
  ```json
  {
    "amount": 2000,
    "category": "Salary",
    "date": "2026-05-28T07:00:00.000Z"
  }
  ```
- **Context**: Authenticated as `attacker_uid`.
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 9: Value Poisoning on Earning (Missing Required Category)
- **Path**: `/users/user_uid/earnings/earn_id`
- **Payload**:
  ```json
  {
    "amount": 250,
    "date": "2026-05-28T07:00:00.000Z"
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 10: Cross-User Stock Investment Write
- **Path**: `/users/victim_uid/stocks/victim_stock_id`
- **Payload**:
  ```json
  {
    "symbol": "GOOGL",
    "investedAmount": 1500,
    "shares": 10,
    "purchaseDate": "2026-05-28T07:00:00.000Z",
    "currency": "USD"
  }
  ```
- **Context**: Authenticated as `attacker_uid`.
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 11: Value Poisoning on Stock Investment (Negative Shares)
- **Path**: `/users/user_uid/stocks/stock_id`
- **Payload**:
  ```json
  {
    "symbol": "AAPL",
    "investedAmount": -500,
    "shares": -5,
    "purchaseDate": "2026-05-28T07:00:00.000Z",
    "currency": "USD"
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED`

### Payload 12: Invalid Path / Document ID poisoning
- **Path**: `/users/user_uid/expenses/ID_EXCEEDING_SIZE_LIMIT_AND_CONTAINING_SPECIAL_CHARACTERS_$$$___$$$`
- **Payload**:
  ```json
  {
    "amount": 50,
    "category": "Food",
    "date": "2026-05-28T07:00:00.000Z"
  }
  ```
- **Expected Outcome**: `PERMISSION_DENIED`

---

## 3. Test Runner Definition (`firestore.rules.test.ts`)

A simulated security test suite using the Firebase Rules Unit Testing library `@firebase/rules-unit-testing`:

```typescript
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { setDoc, doc, collection, addDoc } from 'firebase/firestore';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test-dashboard-app',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Security Rules - The Dirty Dozen TDD', () => {
  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  // Payload 1
  test('Payload 1: Unauthenticated profile write must fail', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await expect(
      setDoc(doc(unauthedDb, 'users/attacker_uid'), {
        name: 'Attacker',
        jobTitle: 'Hacker',
        email: 'attacker@gmail.com',
        currency: 'USD'
      })
    ).rejects.toThrow();
  });

  // Payload 2
  test('Payload 2: Cross-user profile write must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/bob_uid'), {
        name: 'Attacker Profile',
        jobTitle: 'Impersonator',
        email: 'victim@gmail.com',
        currency: 'USD'
      })
    ).rejects.toThrow();
  });

  // Payload 3
  test('Payload 3: Value poisoning on profile (invalid types) must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/alice_uid'), {
        name: 12345,
        jobTitle: true,
        email: 'victim@gmail.com',
        currency: ['USD']
      } as any)
    ).rejects.toThrow();
  });

  // Payload 4
  test('Payload 4: Resource poisoning via gigantic profile name must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/alice_uid'), {
        name: 'A'.repeat(5000),
        jobTitle: 'Product Manager',
        email: 'victim@gmail.com',
        currency: 'USD'
      })
    ).rejects.toThrow();
  });

  // Payload 5
  test('Payload 5: Category size bombing must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/alice_uid'), {
        name: 'Alex',
        jobTitle: 'Staff Engineer',
        email: 'alex@example.com',
        currency: 'USD',
        categories: Array(100).fill('Boom')
      })
    ).rejects.toThrow();
  });

  // Payload 6
  test('Payload 6: Cross-user expense write must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/bob_uid/expenses/some_exp'), {
        amount: 500,
        category: 'Rent',
        date: '2026-05-28T07:00:00.000Z'
      })
    ).rejects.toThrow();
  });

  // Payload 7
  test('Payload 7: Non-numeric expense amount must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/alice_uid/expenses/some_exp'), {
        amount: 'Five Hundred Dollars',
        category: 'Travel',
        date: '2026-05-28T07:00:00.000Z'
      } as any)
    ).rejects.toThrow();
  });

  // Payload 8
  test('Payload 8: Cross-user earning write must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/bob_uid/earnings/some_earn'), {
        amount: 2000,
        category: 'Salary',
        date: '2026-05-28T07:00:00.000Z'
      })
    ).rejects.toThrow();
  });

  // Payload 9
  test('Payload 9: Missing required category on earning must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/alice_uid/earnings/some_earn'), {
        amount: 250,
        date: '2026-05-28T07:00:00.000Z'
      } as any)
    ).rejects.toThrow();
  });

  // Payload 10
  test('Payload 10: Cross-user stock investment write must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/bob_uid/stocks/some_stock'), {
        symbol: 'GOOGL',
        investedAmount: 1500,
        shares: 10,
        purchaseDate: '2026-05-28T07:00:00.000Z',
        currency: 'USD'
      })
    ).rejects.toThrow();
  });

  // Payload 11
  test('Payload 11: Negative stock shares / amount must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/alice_uid/stocks/some_stock'), {
        symbol: 'AAPL',
        investedAmount: -500,
        shares: -5,
        purchaseDate: '2026-05-28T07:00:00.000Z',
        currency: 'USD'
      })
    ).rejects.toThrow();
  });

  // Payload 12
  test('Payload 12: Invalid document ID poisoning must fail', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/alice_uid/expenses/EXPLICIT_JUNK_ID_%%%$$$###!!!___TOO_LONG_STRING_REPEATED_BY_MALICIOUS_PARTY_TO_EXHAUST_RESOURCES_AND_POISON_THE_DATABASE'), {
        amount: 50,
        category: 'Food',
        date: '2026-05-28T07:00:00.000Z'
      })
    ).rejects.toThrow();
  });

  test('Valid writes must succeed', async () => {
    const aliceDb = testEnv.authenticatedContext('alice_uid', { email_verified: true }).firestore();
    await expect(
      setDoc(doc(aliceDb, 'users/alice_uid'), {
        name: 'Alice',
        jobTitle: 'Developer',
        email: 'alice@example.com',
        categories: ['Food', 'Utilities'],
        earningCategories: ['Salary', 'Freelance'],
        currency: 'USD'
      })
    ).resolves.not.toThrow();
  });
});
```
