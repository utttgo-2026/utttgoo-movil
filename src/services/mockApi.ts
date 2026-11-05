export function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateRequest<T>(data: T, ms = 500): Promise<T> {
  await delay(ms);
  return data;
}
