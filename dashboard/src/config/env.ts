function required(
  value: string | undefined,
  name: string,
): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function origin(value: string | undefined, name: string): string {
  const configuredValue = required(value, name);

  try {
    return new URL(configuredValue).origin;
  } catch {
    throw new Error(`Invalid URL environment variable: ${name}`);
  }
}

export const env = {
  API_URL: required(
    process.env.NEXT_PUBLIC_API_URL,
    "NEXT_PUBLIC_API_URL",
  ),
  SOCKET_URL: origin(
    process.env.NEXT_PUBLIC_SOCKET_URL,
    "NEXT_PUBLIC_SOCKET_URL",
  ),
};
