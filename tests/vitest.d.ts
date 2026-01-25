declare module "vitest" {
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => void) => void;
  export const expect: (value: unknown) => {
    toBe: (expected: unknown) => void;
    toEqual: (expected: unknown) => void;
    toHaveLength: (expected: number) => void;
    toContain: (expected: unknown) => void;
  };
  export const vi: {
    mock: (
      path: string,
      factory: () => unknown,
      options?: { virtual?: boolean },
    ) => void;
    spyOn: <T extends object, K extends keyof T>(
      obj: T,
      method: K,
    ) => {
      mockResolvedValue: (value: unknown) => void;
      mockRejectedValue: (error: unknown) => void;
      mockRestore: () => void;
    };
  };
}
