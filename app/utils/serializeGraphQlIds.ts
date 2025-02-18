export const serializeGraphQlIds = (id: string): string => {
  return String(id.split("/").pop());
};
