import { normalizeSnoozeMinutes } from "@/lib/alarm-time";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
  token_uri?: string;
};

type AccessTokenCache = {
  token: string;
  expiresAtMs: number;
};

type FirestoreScalar =
  | null
  | boolean
  | number
  | string
  | FirestoreValue[]
  | { [key: string]: FirestoreValue };

type FirestoreValue = FirestoreScalar;

export type TriggerableUser = {
  id: string;
  phone?: string;
  timezone?: string;
  time?: unknown;
  nextAlarmTime?: string;
  health?: number;
  snoozeMinutes?: number;
  pendingSnooze?: boolean;
  pendingSnoozeRequestedAt?: string;
};

export type UserDailyLog = {
  date: string;
  timezone: string;
  triggeredCallTimes: string[];
  snoozeTimes: string[];
  snoozeCount: number;
  checkedInAt?: string;
};

const FIRESTORE_SCOPE = "https://www.googleapis.com/auth/datastore";
const FIRESTORE_BASE = "https://firestore.googleapis.com/v1";

let tokenCache: AccessTokenCache | null = null;
let tokenPromise: Promise<AccessTokenCache> | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set.`);
  }
  return value;
}

function getServiceAccount(): ServiceAccount {
  const raw = requireEnv("FIREBASE_SERVICE_ACCOUNT_KEY");
  const parsed = JSON.parse(raw) as Partial<ServiceAccount>;

  if (!parsed.client_email || !parsed.private_key || !parsed.project_id) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing required service account fields.");
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key,
    project_id: parsed.project_id,
    token_uri: parsed.token_uri,
  };
}

function toBase64Url(value: string | Uint8Array): string {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const normalized = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function importPrivateKey(privateKeyPem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
}

async function createJwtAssertion(serviceAccount: ServiceAccount): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: FIRESTORE_SCOPE,
    aud: serviceAccount.token_uri || "https://oauth2.googleapis.com/token",
    exp: issuedAt + 3600,
    iat: issuedAt,
  };
  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const key = await importPrivateKey(serviceAccount.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken)
  );

  return `${unsignedToken}.${toBase64Url(new Uint8Array(signature))}`;
}

async function fetchAccessToken(): Promise<AccessTokenCache> {
  const serviceAccount = getServiceAccount();
  const assertion = await createJwtAssertion(serviceAccount);
  const tokenUri = serviceAccount.token_uri || "https://oauth2.googleapis.com/token";
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !json.access_token || !json.expires_in) {
    throw new Error(
      `Failed to fetch Google access token: ${json.error_description || json.error || response.statusText}`
    );
  }

  return {
    token: json.access_token,
    expiresAtMs: Date.now() + json.expires_in * 1000,
  };
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && now < tokenCache.expiresAtMs - 60_000) {
    return tokenCache.token;
  }

  if (!tokenPromise) {
    tokenPromise = fetchAccessToken()
      .then((cache) => {
        tokenCache = cache;
        return cache;
      })
      .finally(() => {
        tokenPromise = null;
      });
  }

  const cache = await tokenPromise;
  return cache.token;
}

function decodeFirestoreValue(value: Record<string, unknown> | undefined): FirestoreValue {
  if (!value) return null;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return typeof value.stringValue === "string" ? value.stringValue : null;
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) {
    return typeof value.timestampValue === "string" ? value.timestampValue : null;
  }
  if ("mapValue" in value && value.mapValue && typeof value.mapValue === "object") {
    const fields =
      "fields" in value.mapValue && value.mapValue.fields && typeof value.mapValue.fields === "object"
        ? (value.mapValue.fields as Record<string, Record<string, unknown>>)
        : {};
    return Object.fromEntries(
      Object.entries(fields).map(([key, inner]) => [key, decodeFirestoreValue(inner)])
    );
  }
  if ("arrayValue" in value && value.arrayValue && typeof value.arrayValue === "object") {
    const values =
      "values" in value.arrayValue && Array.isArray(value.arrayValue.values)
        ? (value.arrayValue.values as Record<string, unknown>[])
        : [];
    return values.map((inner) => decodeFirestoreValue(inner));
  }
  return null;
}

function encodeFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: value.toString() }
      : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map((item) => encodeFirestoreValue(item)) } };
  }
  if (typeof value === "object") {
    const fields = Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, inner]) => [
        key,
        encodeFirestoreValue(inner),
      ])
    );
    return { mapValue: { fields } };
  }
  throw new Error(`Unsupported Firestore value type: ${typeof value}`);
}

function getDocumentId(name: string): string {
  const parts = name.split("/");
  return parts[parts.length - 1] || name;
}

function mapDecodedFields(
  fields: Record<string, Record<string, unknown>> | undefined
): Record<string, FirestoreValue> {
  return Object.fromEntries(
    Object.entries(fields || {}).map(([key, value]) => [key, decodeFirestoreValue(value)])
  );
}

function mapTriggerableUser(doc: {
  name: string;
  fields?: Record<string, Record<string, unknown>>;
}): TriggerableUser {
  const fields = mapDecodedFields(doc.fields);

  return {
    id: getDocumentId(doc.name),
    phone: typeof fields.phone === "string" ? fields.phone : undefined,
    timezone: typeof fields.timezone === "string" ? fields.timezone : undefined,
    time: fields.time,
    nextAlarmTime: typeof fields.nextAlarmTime === "string" ? fields.nextAlarmTime : undefined,
    health: typeof fields.health === "number" ? fields.health : undefined,
    snoozeMinutes: normalizeSnoozeMinutes(fields.snoozeMinutes),
    pendingSnooze: fields.pendingSnooze === true,
    pendingSnoozeRequestedAt:
      typeof fields.pendingSnoozeRequestedAt === "string"
        ? fields.pendingSnoozeRequestedAt
        : undefined,
  } satisfies TriggerableUser;
}

function mapUserDailyLog(doc: {
  name: string;
  fields?: Record<string, Record<string, unknown>>;
}): UserDailyLog {
  const fields = mapDecodedFields(doc.fields);

  return {
    date: typeof fields.date === "string" ? fields.date : getDocumentId(doc.name),
    timezone: typeof fields.timezone === "string" ? fields.timezone : "UTC",
    triggeredCallTimes: Array.isArray(fields.triggeredCallTimes)
      ? fields.triggeredCallTimes.filter((value): value is string => typeof value === "string")
      : [],
    snoozeTimes: Array.isArray(fields.snoozeTimes)
      ? fields.snoozeTimes.filter((value): value is string => typeof value === "string")
      : [],
    snoozeCount: typeof fields.snoozeCount === "number" ? fields.snoozeCount : 0,
    checkedInAt: typeof fields.checkedInAt === "string" ? fields.checkedInAt : undefined,
  } satisfies UserDailyLog;
}

async function firestoreRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${FIRESTORE_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const json = (await response.json()) as T & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(json.error?.message || `Firestore request failed with status ${response.status}.`);
  }

  return json;
}

async function firestoreRequestOrNull<T>(path: string, init?: RequestInit): Promise<T | null> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${FIRESTORE_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (response.status === 404) {
    return null;
  }

  const json = (await response.json()) as T & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(json.error?.message || `Firestore request failed with status ${response.status}.`);
  }

  return json;
}

function buildUpdateMask(fields: string[]): string {
  const params = new URLSearchParams();
  for (const field of fields) {
    params.append("updateMask.fieldPaths", field);
  }
  return params.toString();
}

export async function listUsersReadyForAlarm(nowIso: string): Promise<TriggerableUser[]> {
  const { project_id } = getServiceAccount();
  const results = await firestoreRequest<
    Array<{
      document?: {
        name: string;
        fields?: Record<string, Record<string, unknown>>;
      };
    }>
  >(`/projects/${project_id}/databases/(default)/documents:runQuery`, {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "users" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "nextAlarmTime" },
            op: "LESS_THAN_OR_EQUAL",
            value: { stringValue: nowIso },
          },
        },
        orderBy: [
          {
            field: { fieldPath: "nextAlarmTime" },
            direction: "ASCENDING",
          },
        ],
      },
    }),
  });

  return results
    .filter((row) => row.document?.name)
    .map((row) => mapTriggerableUser(row.document!));
}

export async function listUsersWithAlarmPreferences(): Promise<TriggerableUser[]> {
  const { project_id } = getServiceAccount();
  const results = await firestoreRequest<
    Array<{
      document?: {
        name: string;
        fields?: Record<string, Record<string, unknown>>;
      };
    }>
  >(`/projects/${project_id}/databases/(default)/documents:runQuery`, {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "users" }],
      },
    }),
  });

  return results
    .filter((row) => row.document?.name)
    .map((row) => mapTriggerableUser(row.document!))
    .filter((user) => user.time != null);
}

export async function updateUserFields(
  userId: string,
  fields: Record<string, unknown>
): Promise<void> {
  const { project_id } = getServiceAccount();
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return;

  const fieldNames = entries.map(([field]) => field);
  const params = buildUpdateMask(fieldNames);

  await firestoreRequest(
    `/projects/${project_id}/databases/(default)/documents/users/${encodeURIComponent(userId)}?${params}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fields: {
          ...Object.fromEntries(
            entries.map(([field, value]) => [field, encodeFirestoreValue(value)])
          ),
        },
      }),
    }
  );
}

export async function updateUserNextAlarmTime(userId: string, nextAlarmTime: string): Promise<void> {
  await updateUserFields(userId, { nextAlarmTime });
}

export async function findUserByPhone(phone: string): Promise<TriggerableUser | null> {
  const { project_id } = getServiceAccount();
  const results = await firestoreRequest<
    Array<{
      document?: {
        name: string;
        fields?: Record<string, Record<string, unknown>>;
      };
    }>
  >(`/projects/${project_id}/databases/(default)/documents:runQuery`, {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "users" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "phone" },
            op: "EQUAL",
            value: { stringValue: phone },
          },
        },
        limit: 1,
      },
    }),
  });

  const doc = results.find((row) => row.document?.name)?.document;
  return doc ? mapTriggerableUser(doc) : null;
}

export async function getUserDailyLog(
  userId: string,
  dateKey: string
): Promise<UserDailyLog | null> {
  const { project_id } = getServiceAccount();
  const doc = await firestoreRequestOrNull<{
    name: string;
    fields?: Record<string, Record<string, unknown>>;
  }>(
    `/projects/${project_id}/databases/(default)/documents/users/${encodeURIComponent(userId)}/dailyLogs/${encodeURIComponent(dateKey)}`
  );

  return doc ? mapUserDailyLog(doc) : null;
}

export async function updateUserDailyLog(
  userId: string,
  dateKey: string,
  fields: Partial<UserDailyLog>
): Promise<void> {
  const { project_id } = getServiceAccount();
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return;

  const params = buildUpdateMask(entries.map(([field]) => field));
  await firestoreRequest(
    `/projects/${project_id}/databases/(default)/documents/users/${encodeURIComponent(userId)}/dailyLogs/${encodeURIComponent(dateKey)}?${params}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fields: Object.fromEntries(
          entries.map(([field, value]) => [field, encodeFirestoreValue(value)])
        ),
      }),
    }
  );
}
