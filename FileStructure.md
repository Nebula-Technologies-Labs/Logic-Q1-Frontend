# Project Structure

---

# Project Structure

```text
project/

public/

src/
│
├── app/
│   ├── store.ts
│   ├── router.tsx
│   ├── providers.tsx
│   └── App.tsx
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   │
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Card/
│   │   └── Badge/
│   │
│   └── common/
│       ├── Navbar/
│       ├── Sidebar/
│       └── Footer/
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── authSlice.ts
│   │
│   ├── users/
│   ├── leads/
│   ├── companies/
│   └── deals/
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useWindowSize.ts
│
├── layouts/
│   ├── DashboardLayout.tsx
│   ├── AuthLayout.tsx
│   └── PublicLayout.tsx
│
├── lib/
│   ├── axios.ts
│   ├── api.ts
│   └── queryClient.ts
│
├── pages/
│   ├── Home/
│   ├── Login/
│   ├── NotFound/
│   └── Unauthorized/
│
├── routes/
│   ├── ProtectedRoute.tsx
│   └── index.tsx
│
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── company.service.ts
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.css
│
├── types/
│   ├── api.ts
│   ├── auth.ts
│   └── common.ts
│
├── utils/
│   ├── constants.ts
│   ├── formatters.ts
│   └── validators.ts
│
├── main.tsx
└── vite-env.d.ts

.env
.env.local
.env.development
.env.production

.eslintrc.cjs

.prettierrc

.gitignore

package.json

tsconfig.json

vite.config.ts
```

---

# Architecture Principles

## 1. Use Feature-First Architecture

Group code by business domain instead of file type.

✅ Good

```text
features/
├── auth/
├── users/
├── leads/
├── companies/
└── deals/
```

❌ Avoid

```text
components/
pages/
hooks/
services/
```

for the entire application.

As applications grow, this quickly becomes difficult to maintain.

---

# 2. app/

Contains application bootstrapping code.

```text
app/
├── store.ts
├── router.tsx
├── providers.tsx
└── App.tsx
```

Responsibilities:

- Redux store setup
- React Query setup
- Theme providers
- Authentication providers
- Router configuration
- Global application configuration

---

# 3. features/

Contains all business modules.

Example:

```text
features/
└── leads/
    ├── api/
    ├── components/
    ├── hooks/
    ├── pages/
    ├── types/
    └── utils/
```

Keep everything related to a feature together.

Examples:

```text
features/auth/
features/users/
features/leads/
features/companies/
features/deals/
```

---

# 4. components/ui/

Reusable generic components.

Examples:

```text
Button
Input
Modal
Table
Card
Badge
```

Good:

```tsx
<Button />

<Input />

<Table />
```

Bad:

```tsx
<LeadCard />

<CompanyForm />
```

Business-specific components belong inside `features`.

---

# 5. components/common/

Shared application components.

Examples:

```text
Navbar
Sidebar
Footer
Topbar
Breadcrumbs
```

These can be reused throughout the application.

---

# 6. layouts/

Page shells.

Examples:

```text
DashboardLayout

AuthLayout

PublicLayout
```

Example:

```tsx
<DashboardLayout>
  <Sidebar />
  <Navbar />
  <Outlet />
</DashboardLayout>
```

---

# 7. hooks/

Reusable custom React hooks.

Examples:

```text
useDebounce.ts

useLocalStorage.ts

useWindowSize.ts
```

Keep them generic and reusable.

---

# 8. lib/

Third-party configurations.

Examples:

```text
axios.ts

api.ts

queryClient.ts
```

Contains:

- Axios instance
- React Query client
- Authentication helpers
- Third-party configurations

Example:

```ts
axios.create()

new QueryClient()
```

---

# 9. services/

API wrappers.

Examples:

```text
auth.service.ts

user.service.ts

company.service.ts
```

Example:

```ts
export async function login() {}

export async function getUsers() {}
```

These files communicate with the backend.

---

# 10. routes/

Route definitions.

Examples:

```text
ProtectedRoute.tsx

index.tsx
```

Responsibilities:

- Route declarations
- Authentication guards
- Permission checks

---

# 11. styles/

Global styles.

Examples:

```text
globals.css

variables.css

tailwind.css
```

Responsibilities:

- CSS variables
- Global resets
- Typography
- Tailwind imports

---

# 12. types/

Global TypeScript definitions.

Examples:

```text
User

ApiResponse

Pagination
```

Files:

```text
api.ts

auth.ts

common.ts
```

---

# 13. utils/

Pure helper functions.

Examples:

```text
constants.ts

formatters.ts

validators.ts
```

Examples:

```ts
formatDate()

capitalize()

generateSlug()
```

Do NOT place React code here.

---

# Environment Profiles

Use separate environment files.

```text
.env.development

.env.production

.env.local
```

## .env.development

```env
VITE_API_URL=http://localhost:3210
```

## .env.production

```env
VITE_API_URL=https://api.logiq1.com
```

## .env.local

```env
VITE_ENABLE_DEBUG=true
```

Usage:

```ts
const API_URL = import.meta.env.VITE_API_URL
```

---

# Example CRM Structure

```text
src/

app/

features/
├── auth/
├── dashboard/
├── users/
├── leads/
├── contacts/
├── companies/
├── deals/
├── tasks/
├── activities/
├── reports/
├── workflows/
├── notifications/
└── settings/

components/
├── ui/
└── common/

layouts/

lib/

routes/

hooks/

types/

utils/

styles/
```

---

# Recommended Rules

1. Organize by feature, not by file type.

2. Keep UI components generic.

3. Keep business logic inside features.

4. Keep utility functions pure.

5. Keep API communication inside services.

6. Keep third-party setup inside lib.

7. Keep layouts separate from pages.

8. Keep global types in types.

9. Keep environment variables in `.env.*` files.

10. Avoid creating giant folders with hundreds of files.

---

# Golden Rule

**If a piece of code only belongs to one business module, place it inside that feature.**

**If it can be reused across the entire application, place it in a shared folder.**

Examples:

```text
Reusable across app
    -> components/ui

Reusable business component
    -> components/common

Only for Leads
    -> features/leads

Only for Companies
    -> features/companies

Only for Auth
    -> features/auth
```

This architecture scales well from small projects to large enterprise applications.