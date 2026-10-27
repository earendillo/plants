# Delete Account Feature

## Context

The app needs a way for users to permanently delete their accounts and all associated data.

**Important constraint:**

* `activity_logs` MUST NOT be deleted if they belong to other users' gardens
* User identity must be removed, but events must remain (displayed as "Guest")

---

## Strategy

* **Backend**: API route `DELETE /api/user` using Supabase service role
* **Deletion**: Single call to `auth.admin.deleteUser(userId)` — DB cascades handle cleanup
* **Activity logs**: FK `performed_by_user_id → profiles(id) ON DELETE SET NULL` already exists — deleted users automatically appear as "Guest" in the UI (same as anonymous guest actions)
* **Auth verification**:
  * Password re-entry for email/password users
  * Typed "DELETE" confirmation for OAuth users
* **UI**: Danger zone section on profile page with confirmation dialog

**No migrations needed.** All FK constraints are already correct.

---

## Cascade Chain

```
auth.users DELETE
  ├── profiles (id → auth.users ON DELETE CASCADE)
  │     └── activity_logs.performed_by_user_id → SET NULL (via profiles FK)
  ├── gardens (owner_id → auth.users ON DELETE CASCADE)
  │     ├── plants (garden_id → gardens ON DELETE CASCADE)
  │     ├── garden_share_links (garden_id → gardens ON DELETE CASCADE)
  │     └── garden_members (garden_id → gardens ON DELETE CASCADE)
  └── garden_members (user_id → auth.users ON DELETE CASCADE)
```

---

## Steps

### Step 1: Service role client

**Create** `/lib/supabase/admin.ts`

* Export `createAdminClient()` using `createClient(url, SUPABASE_SERVICE_ROLE_KEY)`
* Config: `persistSession: false`, `autoRefreshToken: false`
* Throw if env var missing

**Modify** `.env.example` — add `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`

---

### Step 2: API route

**Create** `/app/api/user/route.ts`

```
DELETE /api/user
Body (optional): { password: string }
```

Flow:

1. `getAuthenticatedUser()` → 401 if missing
2. Check `user.app_metadata.providers` for `"email"`
3. If email provider: validate password via `signInWithPassword()` → 403 if invalid
4. `createAdminClient().auth.admin.deleteUser(user.id)`
5. Return 204

Error handling: wrap in `handleApiError`

---

### Step 3: i18n keys

**Modify** `messages/en.json` (`profile` namespace):

* `dangerZone`, `deleteAccountWarning`, `deleteAccountButton`
* `deleteAccountTitle`, `deleteAccountConfirm`
* `passwordLabel`, `passwordPlaceholder`
* `typeDeleteLabel`, `typeDeletePlaceholder`
* `invalidPassword`, `deleteAccountError`, `deletingAccount`, `cancel`

**Modify** `messages/pl.json` accordingly

---

### Step 4: DeleteAccountDialog component

**Create** `/components/DeleteAccountDialog.tsx`

Props: `{ userEmail: string, hasPasswordProvider: boolean }`

Pattern: based on `DeleteGardenDialog` (shadcn Dialog, loading/error state)

* Email/password users: password input, submit disabled until filled
* OAuth users: must type "DELETE", submit disabled until match
* On success: `supabase.auth.signOut()` → redirect `/login`
* On error: show inline error
* Target: < 130 lines

---

### Step 5: Profile page integration

**Modify** `/app/(authenticated)/profile/page.tsx`

* Derive `hasPasswordProvider` from `user.app_metadata.providers`
* Add Danger Zone section below ProfileForm: red heading, warning text, `DeleteAccountDialog`

---

## Edge Cases

| Scenario                        | Behavior                                     |
| ------------------------------- | -------------------------------------------- |
| User owns garden with members   | Garden deleted via cascade; members lose access |
| User is member of other gardens | Membership rows removed; gardens remain        |
| Active guest links              | Deleted via cascade                            |
| Activity logs in other gardens  | Preserved; `performed_by_user_id` set to NULL; UI shows "Guest" |
| Concurrent delete requests      | First succeeds, second → 401                   |
| Network failure after delete    | Middleware redirects to login                   |
| Missing service role key        | API returns 500; no partial deletion            |

---

## Verification

1. `npm run lint` + `npx tsc --noEmit`
2. Manual: create user → add plants → share garden → delete account → verify redirect to `/login`
3. Manual: verify activity logs in shared garden still exist, show "Guest"
4. Manual: wrong password → 403 + UI error
5. Manual: cancel dialog → no action
6. DB check: `auth.users` row gone, activity logs remain with `performed_by_user_id = NULL`

---

## Files Summary

| Action | File                                    |
| ------ | --------------------------------------- |
| Create | `/lib/supabase/admin.ts`                |
| Create | `/app/api/user/route.ts`                |
| Create | `/components/DeleteAccountDialog.tsx`    |
| Modify | `/app/(authenticated)/profile/page.tsx` |
| Modify | `/messages/en.json`                     |
| Modify | `/messages/pl.json`                     |
| Modify | `.env.example`                          |
